export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'exploration' | 'construction' | 'diplomatic' | 'military' | 'progression' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: 'count' | 'unique' | 'milestone' | 'combo' | 'condition';
    target: string;
    value: number;
    conditions?: Record<string, any>;
  };
  rewards: {
    experience?: number;
    title?: string;
    resources?: Record<string, number>;
    unlocks?: string[];
  };
  hidden: boolean;
  oneTime: boolean;
}

export interface PlayerAchievement {
  achievementId: string;
  unlockedAt: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
}

export interface PlayerProgression {
  userId: string;
  level: number;
  experience: number;
  experienceToNext: number;
  titles: string[];
  activeTitle?: string;
  achievements: Record<string, PlayerAchievement>;
  statistics: PlayerStatistics;
  milestones: Record<string, number>;
}

export interface PlayerStatistics {
  // Basic stats
  gameStarted: number;
  totalPlayTime: number;
  lastActive: number;
  
  // Actions
  actionsPerformed: number;
  weeklyActionsSubmitted: number;
  
  // Exploration
  territoriesDiscovered: number;
  territoriesClaimed: number;
  
  // Construction
  buildingsConstructed: number;
  structureTypes: Record<string, number>;
  
  // Social
  messagesPosted: number;
  alliancesMade: number;
  warsDeclared: number;
  
  // Resources
  totalWealthGenerated: number;
  totalMagicGained: number;
  totalInfluenceEarned: number;
  
  // Conflicts
  conflictsWon: number;
  conflictsLost: number;
  territoriesConquered: number;
}