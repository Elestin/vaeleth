export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface Deity {
  name: string;
  playerName: string;
  domain: Domain;
  createdAt: number;
  userId: string;
}

export interface Race {
  name: string;
  characteristics: Characteristic[];
  pointsUsed: number;
  createdAt: number;
  userId: string;
}

export interface Characteristic {
  id: string;
  name: string;
  cost: number;
  description: string;
  type: 'positive' | 'negative';
}

export interface GameAction {
  id: string;
  name: string;
  description: string;
  costs: {
    action?: number;
    wealth?: number;
    magic?: number;
    influence?: number;
    command?: number;
  };
}

export interface WeeklyAction {
  actionId: string;
  parameters?: Record<string, any>;
  timestamp: number;
}

export interface PlayerResources {
  actionPoints: number;
  wealthPoints: number;
  magicPoints: number;
  influencePoints: number;
  commandPoints: number;
}

export interface GameState {
  week: number;
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  year: number;
  nextTurnResolution: number;
}

export interface WorldEvent {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  affectedPlayers: string[];
  type: 'exploration' | 'conflict' | 'discovery' | 'natural' | 'diplomatic';
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  type: 'public' | 'alliance' | 'private';
  targetUserId?: string;
}

export type Domain = 
  | 'Death' | 'Water' | 'Fire' | 'War' | 'Sun' | 'Love' | 'Moon'
  | 'Nature' | 'Harvest' | 'Storm' | 'Knowledge' | 'Fertility'
  | 'Luck' | 'Music' | 'Justice' | 'Healing' | 'Dreams'
  | 'Chaos' | 'Forge' | 'Magic' | 'Travel';

export type GameTab = 
  | 'deityCreator' | 'raceCreator' | 'weeklyActions' 
  | 'timeline' | 'worldMap' | 'discussionBoard' | 'gameMaster';

export interface AppState {
  currentUser: User | null;
  currentTab: GameTab;
  deity: Deity | null;
  race: Race | null;
  resources: PlayerResources;
  gameState: GameState;
  isLoading: boolean;
  error: string | null;
}