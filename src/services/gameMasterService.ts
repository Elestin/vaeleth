import { ref, set, get, push } from 'firebase/database';
import { database } from './firebase';
import { WeeklyAction, WorldEvent, PlayerResources, Deity, Race } from '@/types';

// Game Master specific types
export interface PlayerAction {
  id: string;
  playerId: string;
  playerName: string;
  deity: Deity;
  race: Race;
  actions: WeeklyAction[];
  resources: PlayerResources;
  submittedAt: number;
  week: number;
  season: string;
  year: number;
  status: 'pending' | 'approved' | 'modified' | 'rejected';
  gmNotes?: string;
  modifications?: {
    actionChanges: string[];
    resourceAdjustments: Partial<PlayerResources>;
    reasoning: string;
  };
}

export interface TurnState {
  id: string;
  week: number;
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  year: number;
  phase: 'submission' | 'review' | 'resolution' | 'completed';
  submissionDeadline: number;
  playerActions: PlayerAction[];
  gmResolvedEvents: WorldEvent[];
  nextTurnStart: number;
  createdBy: string; // GM user ID
  createdAt: number;
}

export interface GameMasterProfile {
  userId: string;
  permissions: {
    canReviewActions: boolean;
    canModifyActions: boolean;
    canGenerateEvents: boolean;
    canManagePlayers: boolean;
    canControlTurnFlow: boolean;
  };
  assignedRegions?: string[]; // For multiple GMs managing different areas
}

export interface ConflictResolution {
  id: string;
  week: number;
  conflictType: 'territory' | 'resource' | 'diplomatic' | 'trade';
  involvedPlayers: {
    playerId: string;
    playerName: string;
    actions: WeeklyAction[];
    position: string; // their stance/argument
  }[];
  gmDecision: {
    outcome: string;
    reasoning: string;
    effects: {
      playerId: string;
      resourceChanges: Partial<PlayerResources>;
      eventGenerated?: Omit<WorldEvent, 'id'>;
    }[];
    decidedBy: string; // GM user ID
    decidedAt: number;
  };
  status: 'pending' | 'resolved';
}

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  triggerConditions: {
    playerCount?: number;
    specificActions?: string[];
    resourceThresholds?: Partial<PlayerResources>;
    seasonalTrigger?: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
    conflictPresent?: boolean;
  };
  eventVariations: {
    title: string;
    description: string;
    effects: {
      globalEffect?: Partial<PlayerResources>;
      playerSpecificEffects?: {
        condition: string; // e.g., "has_deity_domain_war"
        effect: Partial<PlayerResources>;
      }[];
    };
    probabilityWeight: number;
  }[];
  category: 'natural' | 'political' | 'magical' | 'economic' | 'conflict';
}

export class GameMasterService {
  // Turn Management
  async createNewTurn(gmId: string, week: number, season: string, year: number): Promise<TurnState> {
    const turnId = `turn_${year}_${season}_${week}`;
    const turn: TurnState = {
      id: turnId,
      week,
      season: season as any,
      year,
      phase: 'submission',
      submissionDeadline: Date.now() + (5 * 24 * 60 * 60 * 1000), // 5 days
      playerActions: [],
      gmResolvedEvents: [],
      nextTurnStart: Date.now() + (7 * 24 * 60 * 60 * 1000), // 1 week
      createdBy: gmId,
      createdAt: Date.now()
    };

    const turnRef = ref(database, `gameMaster/turns/${turnId}`);
    await set(turnRef, turn);
    return turn;
  }

  async getCurrentTurn(): Promise<TurnState | null> {
    const turnsRef = ref(database, 'gameMaster/turns');
    const snapshot = await get(turnsRef);
    
    if (!snapshot.exists()) return null;

    const turns = Object.values(snapshot.val()) as TurnState[];
    return turns.find(turn => turn.phase !== 'completed') || null;
  }

  async advanceTurnPhase(turnId: string, newPhase: TurnState['phase']): Promise<void> {
    const turnRef = ref(database, `gameMaster/turns/${turnId}`);
    const snapshot = await get(turnRef);
    
    if (snapshot.exists()) {
      const turn = snapshot.val();
      turn.phase = newPhase;
      await set(turnRef, turn);
    }
  }

  // Player Action Review
  async getPlayerActionsForReview(_week?: number): Promise<PlayerAction[]> {
    const currentTurn = await this.getCurrentTurn();
    if (!currentTurn) return [];

    const actionsRef = ref(database, `playerActions/${currentTurn.id}`);
    const snapshot = await get(actionsRef);

    if (!snapshot.exists()) return [];

    const actions = Object.values(snapshot.val()) as PlayerAction[];
    return actions.filter(action => action.status === 'pending');
  }

  async reviewPlayerAction(
    actionId: string,
    gmId: string,
    decision: 'approved' | 'modified' | 'rejected',
    gmNotes?: string,
    modifications?: PlayerAction['modifications']
  ): Promise<void> {
    const actionRef = ref(database, `playerActions/${actionId}`);
    const snapshot = await get(actionRef);

    if (snapshot.exists()) {
      const action = snapshot.val();
      action.status = decision;
      action.gmNotes = gmNotes;
      action.reviewedBy = gmId;
      action.reviewedAt = Date.now();
      
      if (modifications) {
        action.modifications = modifications;
      }

      await set(actionRef, action);
    }
  }

  // Conflict Detection and Resolution
  async detectConflicts(playerActions: PlayerAction[]): Promise<ConflictResolution[]> {
    const conflicts: ConflictResolution[] = [];
    
    // Territory conflicts (multiple players claiming same territory)
    const territoryActions = playerActions.flatMap(pa => 
      pa.actions.filter(action => action.actionId === 'claimTerritory')
        .map(action => ({ ...action, playerId: pa.playerId, playerName: pa.playerName }))
    );

    const territoryGroups = this.groupBy(territoryActions, action => action.parameters?.territoryId);
    
    Object.entries(territoryGroups).forEach(([territoryId, actions]) => {
      if (actions.length > 1) {
        conflicts.push({
          id: `conflict_territory_${territoryId}_${Date.now()}`,
          week: playerActions[0].week,
          conflictType: 'territory',
          involvedPlayers: actions.map(action => ({
            playerId: action.playerId,
            playerName: action.playerName,
            actions: [action],
            position: `Claims territory ${territoryId}`
          })),
          gmDecision: {} as any,
          status: 'pending'
        });
      }
    });

    // Resource conflicts (trading disputes, resource competition)
    // Add more conflict detection logic here...

    return conflicts;
  }

  async resolveConflict(
    conflictId: string,
    gmId: string,
    outcome: string,
    reasoning: string,
    effects: ConflictResolution['gmDecision']['effects']
  ): Promise<void> {
    const conflictRef = ref(database, `conflicts/${conflictId}`);
    const snapshot = await get(conflictRef);

    if (snapshot.exists()) {
      const conflict = snapshot.val();
      conflict.gmDecision = {
        outcome,
        reasoning,
        effects,
        decidedBy: gmId,
        decidedAt: Date.now()
      };
      conflict.status = 'resolved';

      await set(conflictRef, conflict);

      // Apply effects to players
      for (const effect of effects) {
        await this.applyResourceChanges(effect.playerId, effect.resourceChanges);
        
        if (effect.eventGenerated) {
          await this.generateWorldEvent(effect.eventGenerated);
        }
      }
    }
  }

  // Event Generation and Management
  async generateWorldEvent(event: Omit<WorldEvent, 'id'>): Promise<string> {
    const eventsRef = ref(database, 'worldEvents');
    const eventRef = await push(eventsRef, event);
    return eventRef.key!;
  }

  async getEventTemplates(): Promise<EventTemplate[]> {
    const templatesRef = ref(database, 'eventTemplates');
    const snapshot = await get(templatesRef);
    
    return snapshot.exists() ? Object.values(snapshot.val()) : [];
  }

  async generateEventsForTurn(_turnId: string, playerActions: PlayerAction[]): Promise<WorldEvent[]> {
    const templates = await this.getEventTemplates();
    const generatedEvents: WorldEvent[] = [];
    const turn = await this.getCurrentTurn();

    if (!turn) return [];

    for (const template of templates) {
      if (this.checkEventTriggers(template, playerActions, turn)) {
        const event = this.selectEventVariation(template, playerActions);
        if (event) {
          const worldEvent: WorldEvent = {
            id: '', // Will be set by Firebase
            title: event.title,
            description: event.description,
            type: this.mapCategoryToType(template.category),
            timestamp: Date.now(),
            affectedPlayers: playerActions.map(pa => pa.playerId)
          };

          const eventId = await this.generateWorldEvent(worldEvent);
          generatedEvents.push({ ...worldEvent, id: eventId });

          // Apply event effects
          await this.applyEventEffects(event.effects, playerActions);
        }
      }
    }

    return generatedEvents;
  }

  // Player Management
  async getPlayerOverview(): Promise<Array<{
    playerId: string;
    playerName: string;
    deity: Deity;
    race: Race;
    resources: PlayerResources;
    actionsThisTurn: number;
    lastActive: number;
    trustLevel: 'new' | 'trusted' | 'veteran' | 'problematic';
  }>> {
    const playersRef = ref(database, 'players');
    const snapshot = await get(playersRef);

    if (!snapshot.exists()) return [];

    // Aggregate player data for GM overview
    // const players = Object.values(snapshot.val());
    // Implementation would fetch deity, race, resources for each player
    // and calculate trust levels based on behavior
    
    return []; // Placeholder
  }

  async flagPlayerAction(playerId: string, actionId: string, reason: string, gmId: string): Promise<void> {
    const flagRef = ref(database, `playerFlags/${playerId}/${actionId}`);
    await set(flagRef, {
      reason,
      flaggedBy: gmId,
      flaggedAt: Date.now(),
      resolved: false
    });
  }

  // Analytics and Reporting
  async getTurnStatistics(_turnId: string): Promise<{
    totalPlayers: number;
    actionsSubmitted: number;
    conflictsGenerated: number;
    eventsTriggered: number;
    resourceDistribution: Record<string, number>;
    mostPopularActions: Array<{ actionId: string; count: number }>;
  }> {
    // Implementation would analyze turn data and return statistics
    return {
      totalPlayers: 0,
      actionsSubmitted: 0,
      conflictsGenerated: 0,
      eventsTriggered: 0,
      resourceDistribution: {},
      mostPopularActions: []
    };
  }

  // Utility methods
  private groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      groups[key] = groups[key] || [];
      groups[key].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private checkEventTriggers(template: EventTemplate, actions: PlayerAction[], turn: TurnState): boolean {
    const triggers = template.triggerConditions;
    
    if (triggers.playerCount && actions.length < triggers.playerCount) return false;
    if (triggers.seasonalTrigger && turn.season !== triggers.seasonalTrigger) return false;
    
    // Check for specific actions
    if (triggers.specificActions) {
      const actionIds = actions.flatMap(pa => pa.actions.map(a => a.actionId));
      const hasRequiredActions = triggers.specificActions.some(requiredAction => 
        actionIds.includes(requiredAction)
      );
      if (!hasRequiredActions) return false;
    }

    return true;
  }

  private selectEventVariation(template: EventTemplate, _actions: PlayerAction[]): EventTemplate['eventVariations'][0] | null {
    const totalWeight = template.eventVariations.reduce((sum, variation) => sum + variation.probabilityWeight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const variation of template.eventVariations) {
      currentWeight += variation.probabilityWeight;
      if (random <= currentWeight) {
        return variation;
      }
    }
    
    return template.eventVariations[0]; // Fallback
  }

  private mapCategoryToType(category: EventTemplate['category']): WorldEvent['type'] {
    const mapping: Record<EventTemplate['category'], WorldEvent['type']> = {
      natural: 'natural',
      political: 'diplomatic',
      magical: 'discovery',
      economic: 'exploration',
      conflict: 'conflict'
    };
    return mapping[category];
  }

  private async applyEventEffects(
    effects: EventTemplate['eventVariations'][0]['effects'], 
    playerActions: PlayerAction[]
  ): Promise<void> {
    // Apply global effects to all players
    if (effects.globalEffect) {
      for (const playerAction of playerActions) {
        await this.applyResourceChanges(playerAction.playerId, effects.globalEffect);
      }
    }

    // Apply player-specific effects
    if (effects.playerSpecificEffects) {
      for (const playerAction of playerActions) {
        for (const specificEffect of effects.playerSpecificEffects) {
          if (this.checkPlayerCondition(playerAction, specificEffect.condition)) {
            await this.applyResourceChanges(playerAction.playerId, specificEffect.effect);
          }
        }
      }
    }
  }

  private checkPlayerCondition(playerAction: PlayerAction, condition: string): boolean {
    // Parse and check conditions like "has_deity_domain_war", "has_race_trait_aggressive", etc.
    if (condition.startsWith('has_deity_domain_')) {
      const domain = condition.replace('has_deity_domain_', '');
      return playerAction.deity.domain.toLowerCase() === domain.toLowerCase();
    }
    
    // Add more condition checks as needed
    return false;
  }

  private async applyResourceChanges(playerId: string, changes: Partial<PlayerResources>): Promise<void> {
    const resourcesRef = ref(database, `playerResources/${playerId}`);
    const snapshot = await get(resourcesRef);
    
    if (snapshot.exists()) {
      const resources = snapshot.val();
      Object.entries(changes).forEach(([resource, change]) => {
        if (change !== undefined) {
          resources[resource] = (resources[resource] || 0) + change;
        }
      });
      await set(resourcesRef, resources);
    }
  }
}

export const gameMasterService = new GameMasterService();