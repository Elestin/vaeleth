import React, { useEffect, useState, useRef } from 'react';
import { HexCoordinate, HexTerritory, WorldMapHex, hexMapService, HexMapGenerator } from '@/services/hexMapService';
import { useAuth } from '@/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button-new';
import { Badge } from '@/components/ui/badge';

interface HexWorldMapProps {
  onTerritorySelect?: (territory: HexTerritory) => void;
}

export function HexWorldMap({ onTerritorySelect }: HexWorldMapProps) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [worldMap, setWorldMap] = useState<WorldMapHex | null>(null);
  const [selectedHex, setSelectedHex] = useState<HexTerritory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredHex, setHoveredHex] = useState<HexCoordinate | null>(null);
  const [generator] = useState(new HexMapGenerator());

  const hexSize = 20;
  const canvasWidth = 800;
  const canvasHeight = 600;

  useEffect(() => {
    loadWorldMap();
  }, []);

  const loadWorldMap = async () => {
    try {
      setLoading(true);
      const map = await hexMapService.initializeHexMap();
      setWorldMap(map);
      drawMap(map);
    } catch (err) {
      console.error('Error loading world map:', err);
      setError('Failed to load world map');
    } finally {
      setLoading(false);
    }
  };

  const drawMap = (map: WorldMapHex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate center offset to center the map
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Draw each territory
    Object.values(map.territories).forEach(territory => {
      const pixel = generator.hexToPixel(territory.coordinates, hexSize);
      const x = centerX + pixel.x;
      const y = centerY + pixel.y;

      // Determine hex color based on biome and control status
      let fillColor = getBiomeColor(territory.biome);
      let strokeColor = '#333';
      let strokeWidth = 1;

      // Highlight discovered territories
      if (territory.discoveredBy && territory.discoveredBy.includes(user?.uid || '')) {
        strokeColor = '#fff';
        strokeWidth = 2;
      }

      // Highlight controlled territories
      if (territory.controlledBy === user?.uid) {
        strokeColor = '#00ff00';
        strokeWidth = 3;
      }

      // Highlight hovered hex
      if (hoveredHex && hoveredHex.q === territory.coordinates.q && hoveredHex.r === territory.coordinates.r) {
        strokeColor = '#ffff00';
        strokeWidth = 4;
      }

      // Draw hexagon
      drawHexagon(ctx, x, y, hexSize, fillColor, strokeColor, strokeWidth);

      // Draw features
      if (territory.features?.naturalWonder) {
        ctx.fillStyle = '#ffd700';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('★', x, y + 4);
      }

      if (territory.features?.ruins) {
        ctx.fillStyle = '#8b4513';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', x, y + 8);
      }

      if (territory.settlements.length > 0) {
        ctx.fillStyle = '#000';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏰', x, y - 8);
      }
    });
  };

  const getBiomeColor = (biome: HexTerritory['biome']): string => {
    const colors = {
      ocean: '#1e40af',
      plains: '#65a30d',
      forest: '#166534',
      mountain: '#78716c',
      desert: '#fbbf24',
      tundra: '#e5e7eb',
      swamp: '#4b5563',
      volcano: '#dc2626'
    };
    return colors[biome];
  };

  const drawHexagon = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    fillColor: string,
    strokeColor: string,
    strokeWidth: number
  ) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const hexX = x + size * Math.cos(angle);
      const hexY = y + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(hexX, hexY);
      else ctx.lineTo(hexX, hexY);
    }
    ctx.closePath();
    
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!worldMap || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left - canvasWidth / 2;
    const y = event.clientY - rect.top - canvasHeight / 2;

    const hexCoord = generator.pixelToHex(x, y, hexSize);
    const territoryId = `hex_${hexCoord.q}_${hexCoord.r}`;
    const territory = worldMap.territories[territoryId];

    if (territory) {
      setSelectedHex(territory);
      onTerritorySelect?.(territory);
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!worldMap || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left - canvasWidth / 2;
    const y = event.clientY - rect.top - canvasHeight / 2;

    const hexCoord = generator.pixelToHex(x, y, hexSize);
    setHoveredHex(hexCoord);
    
    if (worldMap) {
      drawMap(worldMap);
    }
  };

  const performHexAction = async (action: 'scout' | 'claim' | 'build') => {
    if (!selectedHex || !user) return;

    try {
      const success = await hexMapService.performHexAction(
        user.uid,
        selectedHex.id,
        action
      );

      if (success) {
        await loadWorldMap();
      }
    } catch (err) {
      console.error('Error performing hex action:', err);
    }
  };

  const regenerateMap = async () => {
    if (!confirm('Are you sure you want to regenerate the map? This will reset all progress.')) return;
    
    try {
      setLoading(true);
      const generator = new HexMapGenerator();
      const newMap = generator.generateWorldMap(12);
      await hexMapService.saveWorldMap(newMap);
      setWorldMap(newMap);
      drawMap(newMap);
    } catch (err) {
      console.error('Error regenerating map:', err);
      setError('Failed to regenerate map');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={loadWorldMap} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-400">Hex World Map</h2>
        <div className="flex gap-2">
          <Button onClick={loadWorldMap} variant="outline" size="sm">
            Refresh Map
          </Button>
          <Button onClick={regenerateMap} variant="destructive" size="sm">
            Regenerate Map
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMouseMove}
                className="border border-amber-600 rounded cursor-crosshair bg-slate-900"
              />
              
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span>Ocean</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span>Plains</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-800 rounded"></div>
                  <span>Forest</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-600 rounded"></div>
                  <span>Mountain</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>Desert</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <span>Tundra</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-700 rounded"></div>
                  <span>Swamp</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span>Volcano</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedHex ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-400">
                  {selectedHex.biome.charAt(0).toUpperCase() + selectedHex.biome.slice(1)} Hex
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Coordinates</p>
                  <p>Q: {selectedHex.coordinates.q}, R: {selectedHex.coordinates.r}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Resources</p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>Food: {selectedHex.resources.food}</div>
                    <div>Prod: {selectedHex.resources.production}</div>
                    <div>Magic: {selectedHex.resources.magic}</div>
                  </div>
                  {selectedHex.resources.strategic && (
                    <Badge className="mt-2">{selectedHex.resources.strategic}</Badge>
                  )}
                </div>

                {selectedHex.features && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Features</p>
                    {selectedHex.features.river && <Badge variant="secondary">River</Badge>}
                    {selectedHex.features.coast && <Badge variant="secondary">Coastal</Badge>}
                    {selectedHex.features.ruins && <Badge variant="destructive">{selectedHex.features.ruins}</Badge>}
                    {selectedHex.features.naturalWonder && <Badge variant="secondary">{selectedHex.features.naturalWonder}</Badge>}
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-400 mb-2">Status</p>
                  {selectedHex.controlledBy === user?.uid ? (
                    <Badge variant="default">Controlled by you</Badge>
                  ) : selectedHex.controlledBy ? (
                    <Badge variant="outline">Controlled by another</Badge>
                  ) : selectedHex.discoveredBy && selectedHex.discoveredBy.includes(user?.uid || '') ? (
                    <Badge variant="secondary">Discovered</Badge>
                  ) : (
                    <Badge variant="destructive">Unexplored</Badge>
                  )}
                </div>

                <div className="space-y-2">
                  {!selectedHex.discoveredBy?.includes(user?.uid || '') && (
                    <Button onClick={() => performHexAction('scout')} className="w-full" size="sm">
                      Scout Territory
                    </Button>
                  )}
                  {selectedHex.discoveredBy?.includes(user?.uid || '') && !selectedHex.controlledBy && (
                    <Button onClick={() => performHexAction('claim')} className="w-full" size="sm">
                      Claim Territory
                    </Button>
                  )}
                  {selectedHex.controlledBy === user?.uid && (
                    <Button onClick={() => performHexAction('build')} className="w-full" size="sm">
                      Build Structure
                    </Button>
                  )}
                </div>

                {selectedHex.settlements.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Settlements</p>
                    {selectedHex.settlements.map(settlement => (
                      <div key={settlement.id} className="text-sm">
                        {settlement.type} - Pop: {settlement.population}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-400">
                Click on a hex to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}