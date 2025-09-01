import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { AppState, User, Deity, Race, PlayerResources, GameState, GameTab } from '@/types';

interface AppStore extends AppState {
  // Auth actions
  setCurrentUser: (user: User | null) => void;
  
  // Navigation actions
  setCurrentTab: (tab: GameTab) => void;
  
  // Game data actions
  setDeity: (deity: Deity | null) => void;
  setRace: (race: Race | null) => void;
  setResources: (resources: PlayerResources) => void;
  updateResources: (updates: Partial<PlayerResources>) => void;
  
  // UI state actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Game state actions
  setGameState: (gameState: GameState) => void;
  
  // Computed getters
  hasDeity: () => boolean;
  hasRace: () => boolean;
  canAccessGame: () => boolean;
  getNextAvailableTab: () => GameTab;
}

const initialGameState: GameState = {
  week: 1,
  season: 'Spring',
  year: 1,
  nextTurnResolution: Date.now() + (7 * 24 * 60 * 60 * 1000) // 1 week from now
};

const initialResources: PlayerResources = {
  actionPoints: 10,
  wealthPoints: 20,
  magicPoints: 15,
  influencePoints: 25,
  commandPoints: 12
};

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentUser: null,
    currentTab: 'deityCreator',
    deity: null,
    race: null,
    resources: initialResources,
    gameState: initialGameState,
    isLoading: true,
    error: null,

    // Auth actions
    setCurrentUser: (user) => {
      set({ currentUser: user });
      if (!user) {
        // Reset all data when user logs out
        set({
          deity: null,
          race: null,
          resources: initialResources,
          currentTab: 'deityCreator',
          error: null
        });
      }
    },

    // Navigation actions
    setCurrentTab: (tab) => set({ currentTab: tab }),

    // Game data actions
    setDeity: (deity) => set({ deity }),
    setRace: (race) => set({ race }),
    setResources: (resources) => set({ resources }),
    updateResources: (updates) => set((state) => ({
      resources: { ...state.resources, ...updates }
    })),

    // UI state actions
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    // Game state actions
    setGameState: (gameState) => set({ gameState }),

    // Computed getters
    hasDeity: () => get().deity !== null,
    hasRace: () => get().race !== null,
    canAccessGame: () => {
      const state = get();
      return state.currentUser !== null && state.deity !== null && state.race !== null;
    },
    getNextAvailableTab: () => {
      const state = get();
      if (!state.currentUser) return 'deityCreator';
      if (!state.deity) return 'deityCreator';
      if (!state.race) return 'raceCreator';
      return 'weeklyActions';
    }
  }))
);

// Selectors for common state combinations
export const useAuth = () => useAppStore((state) => ({
  user: state.currentUser,
  setUser: state.setCurrentUser,
  isAuthenticated: state.currentUser !== null
}));

export const useGameProgress = () => useAppStore((state) => ({
  deity: state.deity,
  race: state.race,
  hasDeity: state.hasDeity(),
  hasRace: state.hasRace(),
  canAccessGame: state.canAccessGame()
}));

export const useNavigation = () => useAppStore((state) => ({
  currentTab: state.currentTab,
  setCurrentTab: state.setCurrentTab,
  getNextAvailableTab: state.getNextAvailableTab
}));

export const useResources = () => useAppStore((state) => ({
  resources: state.resources,
  setResources: state.setResources,
  updateResources: state.updateResources
}));

export const useUI = () => useAppStore((state) => ({
  isLoading: state.isLoading,
  error: state.error,
  setLoading: state.setLoading,
  setError: state.setError
}));