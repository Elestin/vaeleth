import { ref, set, get } from 'firebase/database';
import { database } from './firebase';

// Hex coordinate system using axial coordinates
export interface HexCoordinate {
  q: number; // x-axis in hex space
  r: number; // y-axis in hex space
}

export interface HexTerritory {
  id: string;
  coordinates: HexCoordinate;
  biome: 'ocean' | 'plains' | 'forest' | 'mountain' | 'desert' | 'tundra' | 'swamp' | 'volcano';
  resources: {
    food: number;
    production: number;
    magic: number;
    strategic?: string; // special resources like iron, gems, mana crystals
  };
  controlledBy?: string; // player ID
  discoveredBy: string[]; // player IDs who have discovered this hex
  elevation: number; // for terrain generation
  features?: {
    river?: boolean;
    coast?: boolean;
    ruins?: string; // type of ruins
    naturalWonder?: string;
  };
  settlements: {
    id: string;
    type: 'outpost' | 'town' | 'city' | 'capital';
    population: number;
    buildings: HexBuilding[];
  }[];
}

export interface HexBuilding {
  id: string;
  type: 'temple' | 'fortress' | 'market' | 'academy' | 'farm' | 'mine' | 'port' | 'wonder';
  level: number;
  effects: {
    resourceModifier?: Record<string, number>;
    defenseBonus?: number;
    populationCapacity?: number;
    specialAbility?: string;
  };
}

export interface WorldMapHex {
  centerCoordinate: HexCoordinate;
  radius: number; // how many rings of hexes from center
  territories: Record<string, HexTerritory>;
  seed: number; // for consistent procedural generation
  generatedAt: number;
}

export class HexMapGenerator {
  private seed: number;
  
  constructor(seed?: number) {
    this.seed = seed || Math.floor(Math.random() * 1000000);
  }

  // Convert hex coordinates to pixel coordinates for rendering
  hexToPixel(hex: HexCoordinate, hexSize: number = 30): { x: number; y: number } {
    const x = hexSize * (3/2 * hex.q);
    const y = hexSize * (Math.sqrt(3)/2 * hex.q + Math.sqrt(3) * hex.r);
    return { x, y };
  }

  // Convert pixel coordinates back to hex coordinates
  pixelToHex(x: number, y: number, hexSize: number = 30): HexCoordinate {
    const q = (2/3 * x) / hexSize;
    const r = (-1/3 * x + Math.sqrt(3)/3 * y) / hexSize;
    return this.roundHex({ q, r });
  }

  // Round fractional hex coordinates to nearest hex
  private roundHex(hex: { q: number; r: number }): HexCoordinate {
    const s = -hex.q - hex.r;
    let rq = Math.round(hex.q);
    let rr = Math.round(hex.r);
    let rs = Math.round(s);

    const qDiff = Math.abs(rq - hex.q);
    const rDiff = Math.abs(rr - hex.r);
    const sDiff = Math.abs(rs - s);

    if (qDiff > rDiff && qDiff > sDiff) {
      rq = -rr - rs;
    } else if (rDiff > sDiff) {
      rr = -rq - rs;
    }

    return { q: rq, r: rr };
  }

  // Get all hexes within a certain radius from center
  generateHexRing(center: HexCoordinate, radius: number): HexCoordinate[] {
    const results: HexCoordinate[] = [];
    
    for (let q = -radius; q <= radius; q++) {
      const r1 = Math.max(-radius, -q - radius);
      const r2 = Math.min(radius, -q + radius);
      for (let r = r1; r <= r2; r++) {
        results.push({ q: center.q + q, r: center.r + r });
      }
    }
    
    return results;
  }

  // Generate biome based on distance from center and noise
  private generateBiome(hex: HexCoordinate, distanceFromCenter: number): HexTerritory['biome'] {
    const noise = this.seededRandom(hex.q * 1000 + hex.r);
    
    // Ocean around edges
    if (distanceFromCenter > 8 && noise < 0.7) return 'ocean';
    
    // Biome distribution based on noise and position
    if (noise < 0.15) return 'desert';
    if (noise < 0.25) return 'tundra';
    if (noise < 0.4) return 'mountain';
    if (noise < 0.6) return 'forest';
    if (noise < 0.75) return 'plains';
    if (noise < 0.9) return 'swamp';
    return 'volcano'; // rare
  }

  // Generate resources based on biome and hex position
  private generateResources(biome: HexTerritory['biome'], hex: HexCoordinate): HexTerritory['resources'] {
    const noise = this.seededRandom(hex.q * 2000 + hex.r);
    
    const baseResources = {
      ocean: { food: 2, production: 0, magic: 1 },
      plains: { food: 3, production: 2, magic: 1 },
      forest: { food: 2, production: 2, magic: 3 },
      mountain: { food: 1, production: 4, magic: 2 },
      desert: { food: 1, production: 1, magic: 1 },
      tundra: { food: 1, production: 1, magic: 2 },
      swamp: { food: 2, production: 1, magic: 4 },
      volcano: { food: 0, production: 3, magic: 5 }
    };

    const base = baseResources[biome];
    
    // Add some randomness
    return {
      food: base.food + Math.floor(noise * 2),
      production: base.production + Math.floor(noise * 2),
      magic: base.magic + Math.floor(noise * 2),
      strategic: noise > 0.9 ? this.generateStrategicResource(biome) : undefined
    };
  }

  private generateStrategicResource(biome: HexTerritory['biome']): string {
    const resources = {
      mountain: ['Iron', 'Gold', 'Gems', 'Mithril'],
      forest: ['Ancient Wood', 'Herb Gardens', 'Wild Magic'],
      volcano: ['Obsidian', 'Fire Crystals', 'Elemental Forge'],
      swamp: ['Alchemical Herbs', 'Bog Iron', 'Dark Magic'],
      ocean: ['Pearls', 'Coral', 'Sea Magic'],
      desert: ['Rare Minerals', 'Solar Crystals', 'Ancient Relics'],
      plains: ['Fertile Soil', 'Wild Horses', 'Trade Routes'],
      tundra: ['Ice Crystals', 'Furs', 'Aurora Magic']
    };

    const options = resources[biome] || ['Mysterious Resource'];
    return options[Math.floor(this.seededRandom(Date.now()) * options.length)];
  }

  // Seeded random number generator
  private seededRandom(input: number): number {
    const x = Math.sin(this.seed * 9999 + input * 1000) * 10000;
    return x - Math.floor(x);
  }

  // Generate a complete hex world map
  generateWorldMap(radius: number = 10): WorldMapHex {
    const center: HexCoordinate = { q: 0, r: 0 };
    const hexCoordinates = this.generateHexRing(center, radius);
    const territories: Record<string, HexTerritory> = {};

    hexCoordinates.forEach(coord => {
      const distance = Math.max(Math.abs(coord.q), Math.abs(coord.r), Math.abs(-coord.q - coord.r));
      const biome = this.generateBiome(coord, distance);
      const resources = this.generateResources(biome, coord);

      const territoryId = `hex_${coord.q}_${coord.r}`;
      territories[territoryId] = {
        id: territoryId,
        coordinates: coord,
        biome,
        resources,
        discoveredBy: [],
        elevation: Math.floor(this.seededRandom(coord.q * 500 + coord.r) * 10),
        features: this.generateFeatures(coord, biome, distance),
        settlements: []
      };
    });

    return {
      centerCoordinate: center,
      radius,
      territories,
      seed: this.seed,
      generatedAt: Date.now()
    };
  }

  private generateFeatures(coord: HexCoordinate, biome: HexTerritory['biome'], distance: number): HexTerritory['features'] {
    const noise = this.seededRandom(coord.q * 3000 + coord.r);
    const features: HexTerritory['features'] = {};

    // Rivers (connect different biomes)
    if (noise > 0.8 && biome !== 'ocean') {
      features.river = true;
    }

    // Coastal hexes
    if (biome === 'ocean' || (distance > 6 && noise > 0.7)) {
      features.coast = true;
    }

    // Ancient ruins (rare)
    if (noise > 0.95) {
      const ruinTypes = ['Ancient Temple', 'Ruined City', 'Forgotten Tower', 'Dragon Lair', 'Elemental Nexus'];
      features.ruins = ruinTypes[Math.floor(this.seededRandom(coord.q * 7000 + coord.r) * ruinTypes.length)];
    }

    // Natural wonders (very rare)
    if (noise > 0.98) {
      const wonders = ['Crystal Cave', 'Floating Islands', 'Time Rift', 'World Tree', 'Starfall Lake'];
      features.naturalWonder = wonders[Math.floor(this.seededRandom(coord.q * 9000 + coord.r) * wonders.length)];
    }

    return features;
  }

  // Get neighboring hexes
  getNeighbors(hex: HexCoordinate): HexCoordinate[] {
    const directions = [
      { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
      { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
    ];

    return directions.map(dir => ({
      q: hex.q + dir.q,
      r: hex.r + dir.r
    }));
  }

  // Calculate distance between two hexes
  hexDistance(a: HexCoordinate, b: HexCoordinate): number {
    return Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs((a.q + a.r) - (b.q + b.r)));
  }
}

// Firebase integration for hex maps
export const saveWorldMap = async (worldMap: WorldMapHex): Promise<void> => {
  const mapRef = ref(database, 'worldMapHex');
  await set(mapRef, worldMap);
};

export const loadWorldMap = async (): Promise<WorldMapHex | null> => {
  const mapRef = ref(database, 'worldMapHex');
  const snapshot = await get(mapRef);
  return snapshot.exists() ? snapshot.val() : null;
};

export const initializeHexMap = async (seed?: number): Promise<WorldMapHex> => {
  // Check if map already exists
  let existingMap = await loadWorldMap();
  
  if (!existingMap) {
    // Generate new map
    const generator = new HexMapGenerator(seed);
    const worldMap = generator.generateWorldMap(12); // 12 hex radius = ~400 hexes
    await saveWorldMap(worldMap);
    existingMap = worldMap;
  }
  
  return existingMap;
};

// Player action on hex
export const performHexAction = async (
  playerId: string,
  hexId: string,
  action: 'scout' | 'claim' | 'build' | 'attack',
  parameters?: any
): Promise<boolean> => {
  const worldMap = await loadWorldMap();
  if (!worldMap || !worldMap.territories[hexId]) return false;

  const hex = worldMap.territories[hexId];
  
  switch (action) {
    case 'scout':
      if (!hex.discoveredBy.includes(playerId)) {
        hex.discoveredBy.push(playerId);
      }
      break;
      
    case 'claim':
      if (!hex.controlledBy && hex.discoveredBy.includes(playerId)) {
        hex.controlledBy = playerId;
      }
      break;
      
    case 'build':
      if (hex.controlledBy === playerId && parameters?.buildingType) {
        // Add building logic here
      }
      break;
  }

  await saveWorldMap(worldMap);
  return true;
};

export const hexMapService = {
  HexMapGenerator,
  saveWorldMap,
  loadWorldMap,
  initializeHexMap,
  performHexAction
};