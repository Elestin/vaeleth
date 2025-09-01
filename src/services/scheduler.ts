import { ref, set, get, onValue } from 'firebase/database';
import { database } from './firebase';
import { turnResolutionEngine } from './turnResolution';
import { getDeity, getRace, getWeeklyActions, getPlayerResources, updatePlayerResources } from './database';

interface TurnSchedule {
  nextTurnTime: number;
  isProcessing: boolean;
  currentWeek: number;
  currentSeason: string;
  currentYear: number;
}

export class TurnScheduler {
  private scheduleRef = ref(database, 'gameSchedule');
  private isRunning = false;

  async initialize(): Promise<void> {
    const snapshot = await get(this.scheduleRef);
    
    if (!snapshot.exists()) {
      // Initialize game schedule
      const initialSchedule: TurnSchedule = {
        nextTurnTime: Date.now() + (7 * 24 * 60 * 60 * 1000), // 1 week from now
        isProcessing: false,
        currentWeek: 1,
        currentSeason: 'Spring',
        currentYear: 1
      };
      
      await set(this.scheduleRef, initialSchedule);
    }
    
    this.startScheduler();
  }

  private startScheduler(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Listen for schedule changes
    onValue(this.scheduleRef, (snapshot) => {
      const schedule: TurnSchedule = snapshot.val();
      
      if (schedule && !schedule.isProcessing) {
        const timeUntilTurn = schedule.nextTurnTime - Date.now();
        
        if (timeUntilTurn <= 0) {
          // Time to process turn
          this.processTurn();
        } else {
          // Schedule next check
          setTimeout(() => {
            this.checkTurnSchedule();
          }, Math.min(timeUntilTurn, 60000)); // Check at least every minute
        }
      }
    });
  }

  private async checkTurnSchedule(): Promise<void> {
    const snapshot = await get(this.scheduleRef);
    const schedule: TurnSchedule = snapshot.val();
    
    if (schedule && schedule.nextTurnTime <= Date.now() && !schedule.isProcessing) {
      await this.processTurn();
    }
  }

  private async processTurn(): Promise<void> {
    console.log('Processing turn...');
    
    // Set processing flag
    await set(ref(database, 'gameSchedule/isProcessing'), true);
    
    try {
      // Get all active players
      const activePlayersSnapshot = await get(ref(database, 'deities'));
      const activePlayerIds: string[] = [];
      
      activePlayersSnapshot.forEach((child) => {
        activePlayerIds.push(child.key!);
      });

      // Collect player data
      const playerDataPromises = activePlayerIds.map(async (userId) => {
        const [deity, race, actions, resources] = await Promise.all([
          getDeity(userId),
          getRace(userId),
          getWeeklyActions(userId),
          getPlayerResources(userId)
        ]);

        if (deity && race && resources) {
          return {
            userId,
            deity,
            race,
            actions: actions || [],
            resources
          };
        }
        return null;
      });

      const playerData = (await Promise.all(playerDataPromises)).filter(Boolean);

      if (playerData.length === 0) {
        console.log('No active players, skipping turn processing');
        await this.scheduleNextTurn();
        return;
      }

      // Process the turn
      const { outcomes, nextTurnTime } = await turnResolutionEngine.processTurn(
        playerData as any[]
      );

      // Apply outcomes to player resources
      for (const outcome of outcomes) {
        if (Object.keys(outcome.resourceChanges).length > 0) {
          const currentResources = await getPlayerResources(outcome.userId);
          if (currentResources) {
            const newResources = { ...currentResources };
            
            // Apply resource changes
            Object.entries(outcome.resourceChanges).forEach(([resource, change]) => {
              if (change && newResources[resource as keyof typeof newResources] !== undefined) {
                (newResources[resource as keyof typeof newResources] as number) += change;
                
                // Ensure resources don't go negative
                if ((newResources[resource as keyof typeof newResources] as number) < 0) {
                  (newResources[resource as keyof typeof newResources] as number) = 0;
                }
              }
            });

            await updatePlayerResources(outcome.userId, newResources);
          }
        }
      }

      // Update game schedule
      const gameTime = turnResolutionEngine.getCurrentGameTime();
      const newSchedule: TurnSchedule = {
        nextTurnTime,
        isProcessing: false,
        currentWeek: gameTime.week,
        currentSeason: gameTime.season,
        currentYear: gameTime.year
      };

      await set(this.scheduleRef, newSchedule);

      console.log(`Turn processed successfully. Next turn: ${new Date(nextTurnTime)}`);

    } catch (error) {
      console.error('Error processing turn:', error);
      
      // Reset processing flag on error
      await set(ref(database, 'gameSchedule/isProcessing'), false);
      
      // Schedule retry in 5 minutes
      setTimeout(() => {
        this.checkTurnSchedule();
      }, 5 * 60 * 1000);
    }
  }

  private async scheduleNextTurn(): Promise<void> {
    const nextTurnTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 1 week from now
    
    await set(ref(database, 'gameSchedule'), {
      nextTurnTime,
      isProcessing: false,
      currentWeek: 1,
      currentSeason: 'Spring',
      currentYear: 1
    });
  }

  async getGameTime(): Promise<{
    week: number;
    season: string;
    year: number;
    nextTurnTime: number;
  }> {
    const snapshot = await get(this.scheduleRef);
    const schedule: TurnSchedule = snapshot.val();
    
    return {
      week: schedule.currentWeek,
      season: schedule.currentSeason,
      year: schedule.currentYear,
      nextTurnTime: schedule.nextTurnTime
    };
  }

  async forceProcessTurn(): Promise<void> {
    // Admin function to force turn processing (for testing)
    await this.processTurn();
  }
}

export const turnScheduler = new TurnScheduler();