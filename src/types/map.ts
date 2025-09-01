export interface Territory {
  id: string;
  name: string;
  type: 'mountain' | 'forest' | 'water' | 'plains' | 'desert' | 'tundra' | 'ruins';
  position: {
    x: number;
    y: number;
  };
  size: 'small' | 'medium' | 'large';
  controlledBy?: string; // userId
  resources: {
    wealth?: number;
    magic?: number;
    influence?: number;
  };
  defenseValue: number;
  population: number;
  buildings: Building[];
  adjacentTerritories: string[];
  discoveredBy: string[];
  lastConflict?: {
    timestamp: number;
    participants: string[];
    outcome: 'victory' | 'defeat' | 'stalemate';
  };
}

export interface Building {
  id: string;
  type: 'temple' | 'fortress' | 'market' | 'academy' | 'farm' | 'mine' | 'port';
  name: string;
  level: number;
  effects: {
    resourceGeneration?: Partial<{
      wealth: number;
      magic: number;
      influence: number;
      command: number;
    }>;
    defenseBonus?: number;
    populationBonus?: number;
  };
  constructedAt: number;
  constructedBy: string;
}

export interface MapAction {
  id: string;
  type: 'scout' | 'claim' | 'attack' | 'build' | 'trade';
  territoryId: string;
  userId: string;
  timestamp: number;
  parameters?: {
    buildingType?: Building['type'];
    targetUserId?: string;
    tradeOffer?: {
      giving: Record<string, number>;
      requesting: Record<string, number>;
    };
  };
}

export interface WorldMap {
  territories: Record<string, Territory>;
  width: number;
  height: number;
  lastUpdated: number;
}