import { ref, set, get, push } from 'firebase/database';
import { database } from './firebase';
import { Achievement, PlayerAchievement, PlayerProgression, PlayerStatistics } from '@/types/achievements';
import achievementsData from '@/data/achievements.json';

export class AchievementService {
  private achievements: Achievement[] = achievementsData.achievements as Achievement[];

  async initializePlayerProgression(userId: string): Promise<PlayerProgression> {
    const progressionRef = ref(database, `playerProgression/${userId}`);
    const existing = await get(progressionRef);
    
    if (existing.exists()) {
      return existing.val();
    }

    const initialProgression: PlayerProgression = {
      userId,
      level: 1,
      experience: 0,
      experienceToNext: 100,
      titles: [],
      achievements: {},
      statistics: this.createInitialStatistics(),
      milestones: {}
    };

    await set(progressionRef, initialProgression);
    return initialProgression;
  }

  async getPlayerProgression(userId: string): Promise<PlayerProgression | null> {
    const progressionRef = ref(database, `playerProgression/${userId}`);
    const snapshot = await get(progressionRef);
    
    return snapshot.exists() ? snapshot.val() : null;
  }

  async updateStatistic(userId: string, statistic: keyof PlayerStatistics, value: number, increment: boolean = true): Promise<void> {
    const progression = await this.getPlayerProgression(userId);
    if (!progression) return;

    if (increment) {
      const currentValue = progression.statistics[statistic] as number || 0;
      (progression.statistics as any)[statistic] = currentValue + value;
    } else {
      (progression.statistics as any)[statistic] = value;
    }

    progression.statistics.lastActive = Date.now();

    await this.saveProgression(userId, progression);
    await this.checkAchievements(userId, progression);
  }

  async checkAchievements(userId: string, progression?: PlayerProgression | null): Promise<Achievement[]> {
    if (!progression) {
      progression = await this.getPlayerProgression(userId);
      if (!progression) return [];
    }

    const newlyUnlocked: Achievement[] = [];

    for (const achievement of this.achievements) {
      const playerAchievement = progression.achievements[achievement.id];
      
      // Skip if already completed
      if (playerAchievement?.completed) continue;
      
      // Check if requirements are met
      const meetsRequirements = this.checkRequirements(achievement, progression);
      
      if (meetsRequirements) {
        // Award achievement
        const newAchievement: PlayerAchievement = {
          achievementId: achievement.id,
          unlockedAt: Date.now(),
          progress: achievement.requirements.value,
          maxProgress: achievement.requirements.value,
          completed: true
        };

        progression.achievements[achievement.id] = newAchievement;

        // Apply rewards
        if (achievement.rewards.experience) {
          progression.experience += achievement.rewards.experience;
        }

        if (achievement.rewards.title && !progression.titles.includes(achievement.rewards.title)) {
          progression.titles.push(achievement.rewards.title);
        }

        if (achievement.rewards.resources) {
          // Add resources (would need to integrate with resource system)
          console.log(`Player ${userId} earned resources:`, achievement.rewards.resources);
        }

        newlyUnlocked.push(achievement);

        // Create achievement notification
        await this.createAchievementNotification(userId, achievement);
      } else if (!playerAchievement) {
        // Track progress for incomplete achievements
        const progress = this.calculateProgress(achievement, progression);
        if (progress > 0) {
          progression.achievements[achievement.id] = {
            achievementId: achievement.id,
            unlockedAt: 0,
            progress,
            maxProgress: achievement.requirements.value,
            completed: false
          };
        }
      }
    }

    // Level up check
    const newLevel = this.calculateLevel(progression.experience);
    if (newLevel > progression.level) {
      progression.level = newLevel;
      progression.experienceToNext = this.getExperienceForLevel(newLevel + 1) - progression.experience;
      
      // Level up notification
      await this.createLevelUpNotification(userId, newLevel);
    }

    await this.saveProgression(userId, progression);
    return newlyUnlocked;
  }

  private checkRequirements(achievement: Achievement, progression: PlayerProgression): boolean {
    const { requirements } = achievement;
    const { statistics, milestones } = progression;

    switch (requirements.type) {
      case 'count':
        const currentValue = (statistics as any)[requirements.target] || 0;
        return currentValue >= requirements.value;

      case 'milestone':
        const milestoneValue = milestones[requirements.target] || 0;
        return milestoneValue >= requirements.value;

      case 'unique':
        // For unique achievements like building all 7 types
        if (requirements.target === 'building_types_built') {
          const buildingTypes = (statistics as any).structureTypes || {};
          return Object.keys(buildingTypes).length >= requirements.value;
        }
        return false;

      case 'condition':
        // Special conditions checked elsewhere
        return milestones[requirements.target] >= requirements.value;

      default:
        return false;
    }
  }

  private calculateProgress(achievement: Achievement, progression: PlayerProgression): number {
    const { requirements } = achievement;
    const { statistics, milestones } = progression;

    switch (requirements.type) {
      case 'count':
        return Math.min((statistics as any)[requirements.target] || 0, requirements.value);

      case 'milestone':
        return Math.min(milestones[requirements.target] || 0, requirements.value);

      case 'unique':
        if (requirements.target === 'building_types_built') {
          const buildingTypes = (statistics as any).structureTypes || {};
          return Math.min(Object.keys(buildingTypes).length, requirements.value);
        }
        return 0;

      case 'condition':
        return Math.min(milestones[requirements.target] || 0, requirements.value);

      default:
        return 0;
    }
  }

  private calculateLevel(experience: number): number {
    // Experience formula: level = floor(sqrt(experience / 50))
    return Math.floor(Math.sqrt(experience / 50)) + 1;
  }

  private getExperienceForLevel(level: number): number {
    // Inverse of level formula: experience = (level - 1)² * 50
    return Math.pow(level - 1, 2) * 50;
  }

  async setMilestone(userId: string, milestone: string, value: number = 1): Promise<void> {
    const progression = await this.getPlayerProgression(userId);
    if (!progression) return;

    progression.milestones[milestone] = value;
    
    await this.saveProgression(userId, progression);
    await this.checkAchievements(userId, progression);
  }

  async getUnlockedAchievements(userId: string): Promise<Achievement[]> {
    const progression = await this.getPlayerProgression(userId);
    if (!progression) return [];

    return this.achievements.filter(achievement => 
      progression.achievements[achievement.id]?.completed
    );
  }

  async getProgressTowardsAchievements(userId: string): Promise<Array<Achievement & { progress: number; maxProgress: number }>> {
    const progression = await this.getPlayerProgression(userId);
    if (!progression) return [];

    return this.achievements
      .filter(achievement => !progression.achievements[achievement.id]?.completed)
      .map(achievement => {
        const playerAchievement = progression.achievements[achievement.id];
        return {
          ...achievement,
          progress: playerAchievement?.progress || 0,
          maxProgress: achievement.requirements.value
        };
      });
  }

  private async saveProgression(userId: string, progression: PlayerProgression): Promise<void> {
    const progressionRef = ref(database, `playerProgression/${userId}`);
    await set(progressionRef, progression);
  }

  private async createAchievementNotification(userId: string, achievement: Achievement): Promise<void> {
    const notificationsRef = ref(database, `notifications/${userId}`);
    await push(notificationsRef, {
      type: 'achievement',
      title: `Achievement Unlocked: ${achievement.name}`,
      description: achievement.description,
      achievement: {
        id: achievement.id,
        name: achievement.name,
        rarity: achievement.rarity,
        icon: achievement.icon
      },
      timestamp: Date.now(),
      read: false
    });
  }

  private async createLevelUpNotification(userId: string, newLevel: number): Promise<void> {
    const notificationsRef = ref(database, `notifications/${userId}`);
    await push(notificationsRef, {
      type: 'level_up',
      title: `Level Up! You are now level ${newLevel}`,
      description: `Your divine power grows! Continue shaping Vaeleth to gain more experience.`,
      level: newLevel,
      timestamp: Date.now(),
      read: false
    });
  }

  private createInitialStatistics(): PlayerStatistics {
    return {
      gameStarted: Date.now(),
      totalPlayTime: 0,
      lastActive: Date.now(),
      actionsPerformed: 0,
      weeklyActionsSubmitted: 0,
      territoriesDiscovered: 0,
      territoriesClaimed: 0,
      buildingsConstructed: 0,
      structureTypes: {},
      messagesPosted: 0,
      alliancesMade: 0,
      warsDeclared: 0,
      totalWealthGenerated: 0,
      totalMagicGained: 0,
      totalInfluenceEarned: 0,
      conflictsWon: 0,
      conflictsLost: 0,
      territoriesConquered: 0
    };
  }
}

export const achievementService = new AchievementService();