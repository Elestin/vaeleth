import { ref, get, set, push } from 'firebase/database';
import { database } from './firebase';
import { Territory, MapAction, Building } from '@/types/map';
import territoriesData from '@/data/territories.json';

export const initializeMap = async (): Promise<void> => {
  try {
    const mapRef = ref(database, 'worldMap');
    const snapshot = await get(mapRef);
    
    console.log('Map initialization: snapshot exists?', snapshot.exists());
    
    if (!snapshot.exists()) {
      console.log('Initializing map data...');
      await set(mapRef, {
        territories: territoriesData.territories,
        lastUpdated: Date.now()
      });
      console.log('Map data initialized successfully');
    } else {
      console.log('Map data already exists');
    }
  } catch (error) {
    console.log('Map initialization error:', error);
    // For development - let's try to use local data if Firebase fails
    console.log('Using local territories data as fallback');
  }
};

export const getWorldMap = async (): Promise<Record<string, Territory>> => {
  try {
    const mapRef = ref(database, 'worldMap/territories');
    const snapshot = await get(mapRef);
    
    if (snapshot.exists()) {
      console.log('Loaded territories from Firebase:', Object.keys(snapshot.val()).length);
      return snapshot.val();
    } else {
      console.log('No territories in Firebase, using local data');
      return territoriesData.territories as Record<string, Territory>;
    }
  } catch (error) {
    console.error('Failed to load from Firebase, using local data:', error);
    return territoriesData.territories as Record<string, Territory>;
  }
};

export const getTerritory = async (territoryId: string): Promise<Territory | null> => {
  const territoryRef = ref(database, `worldMap/territories/${territoryId}`);
  const snapshot = await get(territoryRef);
  
  return snapshot.exists() ? snapshot.val() : null;
};

export const updateTerritory = async (territoryId: string, updates: Partial<Territory>): Promise<void> => {
  const territoryRef = ref(database, `worldMap/territories/${territoryId}`);
  const currentTerritory = await getTerritory(territoryId);
  
  if (currentTerritory) {
    await set(territoryRef, { ...currentTerritory, ...updates });
    await set(ref(database, 'worldMap/lastUpdated'), Date.now());
  }
};

export const scoutTerritory = async (territoryId: string, userId: string): Promise<{
  success: boolean;
  territory?: Territory;
  discoveries?: string[];
}> => {
  const territory = await getTerritory(territoryId);
  
  if (!territory) {
    return { success: false };
  }

  // Add user to discovered list if not already there
  if (!territory.discoveredBy.includes(userId)) {
    territory.discoveredBy.push(userId);
    await updateTerritory(territoryId, territory);
  }

  // Generate discoveries based on territory type and resources
  const discoveries = generateScoutingDiscoveries(territory);

  return {
    success: true,
    territory,
    discoveries
  };
};

export const claimTerritory = async (
  territoryId: string, 
  userId: string, 
  militaryStrength: number
): Promise<{
  success: boolean;
  message: string;
  conflictResult?: 'victory' | 'defeat' | 'stalemate';
}> => {
  const territory = await getTerritory(territoryId);
  
  if (!territory) {
    return { success: false, message: 'Territory not found' };
  }

  if (territory.controlledBy === userId) {
    return { success: false, message: 'You already control this territory' };
  }

  // Check if territory is contested
  if (territory.controlledBy) {
    // PvP conflict resolution
    const defenseStrength = territory.defenseValue + (territory.population * 0.1);
    const attackStrength = militaryStrength;
    
    const conflictResult = resolveConflict(attackStrength, defenseStrength);
    
    if (conflictResult === 'victory') {
      territory.controlledBy = userId;
      territory.lastConflict = {
        timestamp: Date.now(),
        participants: [userId, territory.controlledBy],
        outcome: 'victory'
      };
      
      await updateTerritory(territoryId, territory);
      
      return {
        success: true,
        message: 'Territory conquered!',
        conflictResult: 'victory'
      };
    } else {
      return {
        success: false,
        message: 'Failed to conquer territory',
        conflictResult
      };
    }
  } else {
    // Unclaimed territory - easier to claim
    const claimDifficulty = territory.defenseValue * 0.5;
    
    if (militaryStrength >= claimDifficulty) {
      territory.controlledBy = userId;
      await updateTerritory(territoryId, territory);
      
      return {
        success: true,
        message: 'Territory claimed successfully!'
      };
    } else {
      return {
        success: false,
        message: 'Insufficient military strength to claim this territory'
      };
    }
  }
};

export const buildInTerritory = async (
  territoryId: string,
  userId: string,
  buildingType: Building['type']
): Promise<{
  success: boolean;
  message: string;
  building?: Building;
}> => {
  const territory = await getTerritory(territoryId);
  
  if (!territory) {
    return { success: false, message: 'Territory not found' };
  }

  if (territory.controlledBy !== userId) {
    return { success: false, message: 'You must control this territory to build here' };
  }

  // Check if building type already exists
  const existingBuilding = territory.buildings.find(b => b.type === buildingType);
  if (existingBuilding) {
    return { success: false, message: 'This building type already exists in this territory' };
  }

  const building = createBuilding(buildingType, userId);
  territory.buildings.push(building);
  
  // Apply building effects to territory
  if (building.effects.defenseBonus) {
    territory.defenseValue += building.effects.defenseBonus;
  }
  
  if (building.effects.populationBonus) {
    territory.population += building.effects.populationBonus;
  }

  await updateTerritory(territoryId, territory);

  return {
    success: true,
    message: `${building.name} constructed successfully!`,
    building
  };
};

export const getPlayerTerritories = async (userId: string): Promise<Territory[]> => {
  const worldMap = await getWorldMap();
  
  return Object.values(worldMap).filter(territory => 
    territory.controlledBy === userId
  );
};

export const getTerritoryResourceGeneration = (territory: Territory): {
  wealth: number;
  magic: number;
  influence: number;
  command: number;
} => {
  const baseResources = {
    wealth: territory.resources.wealth || 0,
    magic: territory.resources.magic || 0,
    influence: territory.resources.influence || 0,
    command: 0
  };

  // Add building bonuses
  territory.buildings.forEach(building => {
    if (building.effects.resourceGeneration) {
      const generation = building.effects.resourceGeneration;
      baseResources.wealth += generation.wealth || 0;
      baseResources.magic += generation.magic || 0;
      baseResources.influence += generation.influence || 0;
      baseResources.command += generation.command || 0;
    }
  });

  // Population bonus (more people = more influence)
  baseResources.influence += Math.floor(territory.population / 100);

  return baseResources;
};

export const recordMapAction = async (action: Omit<MapAction, 'id'>): Promise<void> => {
  const actionsRef = ref(database, 'mapActions');
  await push(actionsRef, {
    ...action,
    timestamp: Date.now()
  });
};

// Helper functions
function generateScoutingDiscoveries(territory: Territory): string[] {
  const discoveries: string[] = [];
  
  if (territory.resources.wealth && territory.resources.wealth > 5) {
    discoveries.push('Rich resource deposits detected');
  }
  
  if (territory.resources.magic && territory.resources.magic > 8) {
    discoveries.push('Powerful magical energies emanate from this land');
  }
  
  if (territory.type === 'ruins') {
    discoveries.push('Ancient structures hold forgotten secrets');
  }
  
  if (territory.population > 500) {
    discoveries.push('Large population centers offer strategic value');
  }
  
  if (territory.defenseValue > 80) {
    discoveries.push('Natural fortifications provide excellent defense');
  }

  return discoveries;
}

function resolveConflict(attackStrength: number, defenseStrength: number): 'victory' | 'defeat' | 'stalemate' {
  const attackRoll = Math.random() * attackStrength;
  const defenseRoll = Math.random() * defenseStrength;
  
  if (attackRoll > defenseRoll * 1.2) {
    return 'victory';
  } else if (defenseRoll > attackRoll * 1.2) {
    return 'defeat';
  } else {
    return 'stalemate';
  }
}

function createBuilding(type: Building['type'], userId: string): Building {
  const buildingConfigs: Record<Building['type'], {
    name: string;
    effects: Building['effects'];
  }> = {
    temple: {
      name: 'Divine Temple',
      effects: {
        resourceGeneration: { magic: 3, influence: 2 },
        defenseBonus: 15
      }
    },
    fortress: {
      name: 'Mighty Fortress',
      effects: {
        resourceGeneration: { command: 2 },
        defenseBonus: 40
      }
    },
    market: {
      name: 'Trading Market',
      effects: {
        resourceGeneration: { wealth: 5, influence: 1 }
      }
    },
    academy: {
      name: 'Academy of Learning',
      effects: {
        resourceGeneration: { magic: 2, influence: 3 }
      }
    },
    farm: {
      name: 'Divine Farmlands',
      effects: {
        resourceGeneration: { wealth: 3 },
        populationBonus: 100
      }
    },
    mine: {
      name: 'Sacred Mine',
      effects: {
        resourceGeneration: { wealth: 6 }
      }
    },
    port: {
      name: 'Divine Harbor',
      effects: {
        resourceGeneration: { wealth: 4, influence: 2 }
      }
    }
  };

  const config = buildingConfigs[type];
  
  return {
    id: `${type}_${Date.now()}`,
    type,
    name: config.name,
    level: 1,
    effects: config.effects,
    constructedAt: Date.now(),
    constructedBy: userId
  };
}