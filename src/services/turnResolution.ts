import { WeeklyAction, WorldEvent, PlayerResources, Deity, Race } from '@/types';
import { addWorldEvent } from './database';
import actionsData from '@/data/actions.json';

interface PlayerActionData {
  userId: string;
  deity: Deity;
  race: Race;
  actions: WeeklyAction[];
  resources: PlayerResources;
}

interface ActionOutcome {
  userId: string;
  success: boolean;
  resourceChanges: Partial<PlayerResources>;
  worldEvents: Omit<WorldEvent, 'id'>[];
  discoveries?: string[];
  conflicts?: {
    targetUserId: string;
    type: 'territory' | 'resource' | 'diplomatic';
  }[];
}

export class TurnResolutionEngine {
  private currentWeek: number = 1;
  private currentSeason: 'Spring' | 'Summer' | 'Autumn' | 'Winter' = 'Spring';
  private currentYear: number = 1;

  async processTurn(playerData: PlayerActionData[]): Promise<{
    outcomes: ActionOutcome[];
    nextTurnTime: number;
  }> {
    const outcomes: ActionOutcome[] = [];

    // Phase 1: Individual action resolution
    for (const player of playerData) {
      const outcome = await this.resolvePlayerActions(player);
      outcomes.push(outcome);
    }

    // Phase 2: Conflict resolution
    await this.resolveConflicts(outcomes);

    // Phase 3: World events and seasonal effects
    await this.generateWorldEvents(outcomes);

    // Phase 4: Resource regeneration and maintenance
    await this.applySeasonalEffects(outcomes);

    // Update game time
    this.advanceTime();

    // Schedule next turn
    const nextTurnTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 1 week

    return { outcomes, nextTurnTime };
  }

  private async resolvePlayerActions(player: PlayerActionData): Promise<ActionOutcome> {
    const outcome: ActionOutcome = {
      userId: player.userId,
      success: true,
      resourceChanges: {},
      worldEvents: [],
      discoveries: [],
      conflicts: []
    };

    for (const weeklyAction of player.actions) {
      const actionConfig = actionsData.actions.find(a => a.id === weeklyAction.actionId);
      if (!actionConfig) continue;

      const actionResult = await this.resolveAction(
        actionConfig,
        player
      );

      // Merge results
      this.mergeResourceChanges(outcome.resourceChanges, actionResult.resourceChanges || {});
      outcome.worldEvents.push(...(actionResult.worldEvents || []));
      
      if (actionResult.discoveries) {
        outcome.discoveries = [...(outcome.discoveries || []), ...actionResult.discoveries];
      }
      
      if (actionResult.conflicts) {
        outcome.conflicts = [...(outcome.conflicts || []), ...actionResult.conflicts];
      }
    }

    return outcome;
  }

  private async resolveAction(
    actionConfig: any,
    player: PlayerActionData
  ): Promise<Partial<ActionOutcome>> {
    const baseSuccess = 0.8; // 80% base success rate
    const raceModifier = this.calculateRaceModifier(player.race, actionConfig.id);
    const domainModifier = this.calculateDomainModifier(player.deity.domain, actionConfig.id);
    
    const successChance = Math.min(0.95, baseSuccess + raceModifier + domainModifier);
    const isSuccess = Math.random() < successChance;

    if (!isSuccess) {
      return {
        resourceChanges: { actionPoints: -1 }, // Partial refund on failure
        worldEvents: [{
          title: `${player.deity.name}'s ${actionConfig.name} Failed`,
          description: `The divine attempt to ${actionConfig.name.toLowerCase()} encountered unexpected complications.`,
          timestamp: Date.now(),
          type: 'natural',
          affectedPlayers: [player.userId]
        }]
      };
    }

    // Action-specific resolution
    switch (actionConfig.id) {
      case 'exploration':
        return this.resolveExploration(player);
      
      case 'buildStructure':
        return this.resolveBuildStructure(player);
        
      case 'researchTech':
        return this.resolveResearch(player);
        
      case 'spying':
        return this.resolveSpying(player);
        
      case 'sabotage':
        return this.resolveSabotage(player);
        
      default:
        return this.resolveGenericAction(actionConfig, player);
    }
  }

  private resolveExploration(player: PlayerActionData): Partial<ActionOutcome> {
    const discoveries = [];
    const resourceChanges: Partial<PlayerResources> = {};
    const worldEvents: Omit<WorldEvent, 'id'>[] = [];

    // Random discovery types
    const discoveryRoll = Math.random();
    
    if (discoveryRoll < 0.3) {
      // Resource discovery
      const resourceGain = Math.floor(Math.random() * 10) + 5;
      resourceChanges.wealthPoints = resourceGain;
      discoveries.push('Rich mineral deposits');
      
      worldEvents.push({
        title: `${player.deity.name} Discovers Treasure`,
        description: `Exploration reveals valuable resources in the wilderness, enriching the divine realm.`,
        timestamp: Date.now(),
        type: 'discovery',
        affectedPlayers: [player.userId]
      });
      
    } else if (discoveryRoll < 0.6) {
      // Ancient ruins
      const magicGain = Math.floor(Math.random() * 8) + 3;
      resourceChanges.magicPoints = magicGain;
      discoveries.push('Ancient magical ruins');
      
      worldEvents.push({
        title: `${player.deity.name} Uncovers Ancient Ruins`,
        description: `Mysterious ruins filled with arcane energy are discovered, boosting magical understanding.`,
        timestamp: Date.now(),
        type: 'discovery',
        affectedPlayers: [player.userId]
      });
      
    } else {
      // Neutral territory
      const influenceGain = Math.floor(Math.random() * 6) + 2;
      resourceChanges.influencePoints = influenceGain;
      discoveries.push('Inhabited settlements');
      
      worldEvents.push({
        title: `${player.deity.name} Contacts New Peoples`,
        description: `Exploration leads to contact with previously unknown settlements, expanding influence.`,
        timestamp: Date.now(),
        type: 'exploration',
        affectedPlayers: [player.userId]
      });
    }

    return { resourceChanges, worldEvents, discoveries };
  }

  private resolveBuildStructure(player: PlayerActionData): Partial<ActionOutcome> {
    const structures = ['Temple', 'Fortress', 'Market', 'Academy', 'Farm'];
    const structure = structures[Math.floor(Math.random() * structures.length)];
    
    const resourceChanges: Partial<PlayerResources> = {
      wealthPoints: Math.floor(Math.random() * 5) + 2 // Ongoing income
    };

    const worldEvents: Omit<WorldEvent, 'id'>[] = [{
      title: `${player.deity.name} Constructs ${structure}`,
      description: `A mighty ${structure.toLowerCase()} rises in the divine realm, strengthening the god's power.`,
      timestamp: Date.now(),
      type: 'exploration',
      affectedPlayers: [player.userId]
    }];

    return { resourceChanges, worldEvents };
  }

  private resolveResearch(player: PlayerActionData): Partial<ActionOutcome> {
    const technologies = [
      'Divine Architecture', 'Arcane Warfare', 'Celestial Navigation',
      'Sacred Geometry', 'Elemental Mastery', 'Time Manipulation'
    ];
    
    const tech = technologies[Math.floor(Math.random() * technologies.length)];
    
    const resourceChanges: Partial<PlayerResources> = {
      magicPoints: Math.floor(Math.random() * 8) + 5,
      influencePoints: Math.floor(Math.random() * 4) + 2
    };

    const worldEvents: Omit<WorldEvent, 'id'>[] = [{
      title: `${player.deity.name} Masters ${tech}`,
      description: `Divine research yields breakthrough in ${tech.toLowerCase()}, advancing cosmic understanding.`,
      timestamp: Date.now(),
      type: 'discovery',
      affectedPlayers: [player.userId]
    }];

    return { resourceChanges, worldEvents, discoveries: [tech] };
  }

  private resolveSpying(player: PlayerActionData): Partial<ActionOutcome> {
    // TODO: Implement actual player targeting
    const worldEvents: Omit<WorldEvent, 'id'>[] = [{
      title: `${player.deity.name}'s Agents Gather Intelligence`,
      description: `Covert operations reveal secrets about rival divine realms and their activities.`,
      timestamp: Date.now(),
      type: 'diplomatic',
      affectedPlayers: [player.userId]
    }];

    return { 
      worldEvents,
      resourceChanges: { influencePoints: Math.floor(Math.random() * 3) + 1 }
    };
  }

  private resolveSabotage(player: PlayerActionData): Partial<ActionOutcome> {
    // TODO: Implement actual player targeting and conflict system
    const worldEvents: Omit<WorldEvent, 'id'>[] = [{
      title: `${player.deity.name} Strikes from the Shadows`,
      description: `Sabotage operations disrupt rival operations, though the perpetrator remains hidden.`,
      timestamp: Date.now(),
      type: 'conflict',
      affectedPlayers: [player.userId]
    }];

    return { worldEvents };
  }

  private resolveGenericAction(actionConfig: any, player: PlayerActionData): Partial<ActionOutcome> {
    const worldEvents: Omit<WorldEvent, 'id'>[] = [{
      title: `${player.deity.name} ${actionConfig.name}`,
      description: actionConfig.description,
      timestamp: Date.now(),
      type: 'exploration',
      affectedPlayers: [player.userId]
    }];

    return { worldEvents };
  }

  private calculateRaceModifier(race: Race, actionId: string): number {
    const modifiers: Record<string, Record<string, number>> = {
      'exploration': {
        'swift': 0.1,
        'nightVision': 0.05,
        'flight': 0.15
      },
      'buildStructure': {
        'sturdy': 0.1,
        'nimbleFingers': 0.08
      },
      'researchTech': {
        'intelligent': 0.15,
        'magicAffinity': 0.1
      },
      'spying': {
        'stealthy': 0.2,
        'telepathy': 0.1
      }
    };

    let modifier = 0;
    const actionModifiers = modifiers[actionId] || {};
    
    race.characteristics.forEach(char => {
      if (actionModifiers[char.id]) {
        modifier += actionModifiers[char.id];
      }
    });

    return modifier;
  }

  private calculateDomainModifier(domain: string, actionId: string): number {
    const modifiers: Record<string, Record<string, number>> = {
      'exploration': {
        'Travel': 0.1,
        'Nature': 0.05
      },
      'buildStructure': {
        'Forge': 0.15,
        'Earth': 0.1
      },
      'researchTech': {
        'Knowledge': 0.2,
        'Magic': 0.15
      },
      'spying': {
        'Dreams': 0.1,
        'Chaos': 0.05
      }
    };

    return modifiers[actionId]?.[domain] || 0;
  }

  private async resolveConflicts(_outcomes: ActionOutcome[]): Promise<void> {
    // Implement conflict resolution between players
    // This is a placeholder for future PvP mechanics
  }

  private async generateWorldEvents(outcomes: ActionOutcome[]): Promise<void> {
    // Generate random world events based on collective player actions
    const playerCount = outcomes.length;
    if (Math.random() < 0.3 && playerCount > 0) {
      const globalEvent: Omit<WorldEvent, 'id'> = {
        title: 'The Cosmic Winds Shift',
        description: 'A great change sweeps across Vaeleth, affecting all divine realms.',
        timestamp: Date.now(),
        type: 'natural',
        affectedPlayers: outcomes.map(o => o.userId)
      };
      
      await addWorldEvent(globalEvent);
    }
  }

  private async applySeasonalEffects(outcomes: ActionOutcome[]): Promise<void> {
    const seasonalBonus = this.getSeasonalResourceBonus();
    
    outcomes.forEach(outcome => {
      this.mergeResourceChanges(outcome.resourceChanges, seasonalBonus);
    });
  }

  private getSeasonalResourceBonus(): Partial<PlayerResources> {
    switch (this.currentSeason) {
      case 'Spring':
        return { wealthPoints: 2, magicPoints: 1 }; // Growth and renewal
      case 'Summer':
        return { actionPoints: 1, influencePoints: 1 }; // Activity and expansion
      case 'Autumn':
        return { wealthPoints: 3 }; // Harvest
      case 'Winter':
        return { magicPoints: 2 }; // Contemplation and study
      default:
        return {};
    }
  }

  private mergeResourceChanges(
    target: Partial<PlayerResources>,
    source: Partial<PlayerResources>
  ): void {
    (Object.keys(source) as Array<keyof PlayerResources>).forEach(key => {
      target[key] = (target[key] || 0) + (source[key] || 0);
    });
  }

  private advanceTime(): void {
    this.currentWeek++;
    
    if (this.currentWeek > 12) {
      this.currentWeek = 1;
      
      const seasons: Array<'Spring' | 'Summer' | 'Autumn' | 'Winter'> = 
        ['Spring', 'Summer', 'Autumn', 'Winter'];
      const currentSeasonIndex = seasons.indexOf(this.currentSeason);
      
      if (currentSeasonIndex === 3) {
        this.currentSeason = 'Spring';
        this.currentYear++;
      } else {
        this.currentSeason = seasons[currentSeasonIndex + 1];
      }
    }
  }

  getCurrentGameTime() {
    return {
      week: this.currentWeek,
      season: this.currentSeason,
      year: this.currentYear
    };
  }
}

export const turnResolutionEngine = new TurnResolutionEngine();