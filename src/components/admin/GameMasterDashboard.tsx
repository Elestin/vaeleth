import { useEffect, useState } from 'react';
import { gameMasterService, PlayerAction, TurnState, ConflictResolution } from '@/services/gameMasterService';
import { useAuth } from '@/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button-new';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select-new';
import { Textarea } from '@/components/ui/textarea';
import { 
  Crown, 
  Users, 
  CheckCircle, 
  Calendar,
  Sword,
  FileText,
  Settings,
  TrendingUp
} from 'lucide-react';

export function GameMasterDashboard() {
  const { user } = useAuth();
  const [currentTurn, setCurrentTurn] = useState<TurnState | null>(null);
  const [pendingActions, setPendingActions] = useState<PlayerAction[]>([]);
  const [conflicts] = useState<ConflictResolution[]>([]);
  const [selectedAction, setSelectedAction] = useState<PlayerAction | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'modified' | 'rejected'>('approved');
  const [gmNotes, setGmNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [turn, actions] = await Promise.all([
        gameMasterService.getCurrentTurn(),
        gameMasterService.getPlayerActionsForReview(),
      ]);

      setCurrentTurn(turn);
      setPendingActions(actions);

      if (turn) {
        const stats = await gameMasterService.getTurnStatistics(turn.id);
        setStatistics(stats);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async () => {
    if (!selectedAction || !user) return;

    try {
      await gameMasterService.reviewPlayerAction(
        selectedAction.id,
        user.uid,
        reviewDecision,
        gmNotes || undefined
      );

      // Refresh data
      await loadDashboardData();
      setSelectedAction(null);
      setGmNotes('');
    } catch (error) {
      console.error('Error reviewing action:', error);
    }
  };

  const createNewTurn = async () => {
    if (!user) return;

    try {
      const nextWeek = currentTurn ? currentTurn.week + 1 : 1;
      const nextSeason = currentTurn?.season || 'Spring';
      const nextYear = currentTurn?.year || 1;

      await gameMasterService.createNewTurn(user.uid, nextWeek, nextSeason, nextYear);
      await loadDashboardData();
    } catch (error) {
      console.error('Error creating new turn:', error);
    }
  };

  const advanceTurnPhase = async (newPhase: TurnState['phase']) => {
    if (!currentTurn) return;

    try {
      await gameMasterService.advanceTurnPhase(currentTurn.id, newPhase);
      await loadDashboardData();
    } catch (error) {
      console.error('Error advancing turn phase:', error);
    }
  };

  const getActionIcon = (actionId: string) => {
    switch (actionId) {
      case 'claimTerritory': return <Sword className="h-4 w-4" />;
      case 'buildStructure': return <Settings className="h-4 w-4" />;
      case 'diplomacy': return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPhaseColor = (phase: TurnState['phase']) => {
    switch (phase) {
      case 'submission': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      case 'resolution': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Crown className="h-8 w-8 text-amber-400" />
          <div>
            <h1 className="text-3xl font-bold text-amber-400">Game Master Dashboard</h1>
            <p className="text-gray-400">Administrative control for Vaeleth</p>
          </div>
        </div>
        <Button onClick={createNewTurn} variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Create New Turn
        </Button>
      </div>

      {/* Turn Status Overview */}
      {currentTurn && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Turn: Week {currentTurn.week}, {currentTurn.season} {currentTurn.year}</span>
              <Badge className={`${getPhaseColor(currentTurn.phase)} text-white`}>
                {currentTurn.phase.charAt(0).toUpperCase() + currentTurn.phase.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{pendingActions.length}</div>
                <div className="text-sm text-gray-400">Pending Actions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{statistics?.totalPlayers || 0}</div>
                <div className="text-sm text-gray-400">Active Players</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{conflicts.length}</div>
                <div className="text-sm text-gray-400">Conflicts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{statistics?.eventsTriggered || 0}</div>
                <div className="text-sm text-gray-400">Events Generated</div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button 
                onClick={() => advanceTurnPhase('review')} 
                disabled={currentTurn.phase !== 'submission'}
                size="sm"
              >
                Start Review Phase
              </Button>
              <Button 
                onClick={() => advanceTurnPhase('resolution')} 
                disabled={currentTurn.phase !== 'review'}
                size="sm"
              >
                Begin Resolution
              </Button>
              <Button 
                onClick={() => advanceTurnPhase('completed')} 
                disabled={currentTurn.phase !== 'resolution'}
                size="sm"
              >
                Complete Turn
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="actions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="actions">Player Actions</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="events">World Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-semibold text-amber-400">Pending Player Actions</h3>
              
              {pendingActions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-400">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No pending actions to review</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pendingActions.map(action => (
                    <div
                      key={action.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedAction?.id === action.id ? 'ring-2 ring-amber-400' : ''
                      }`}
                      onClick={() => setSelectedAction(action)}
                    >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              {getActionIcon(action.actions[0]?.actionId || '')}
                              <span className="font-medium">{action.playerName}</span>
                            </div>
                            <Badge variant="secondary">
                              {action.deity.name} - {action.race.name}
                            </Badge>
                          </div>
                          <Badge variant="outline">{action.actions.length} actions</Badge>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-400">
                          Submitted: {new Date(action.submittedAt).toLocaleDateString()}
                        </div>
                        
                        <div className="mt-2 space-y-1">
                          {action.actions.slice(0, 2).map((act, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="text-amber-400">{act.actionId}</span>
                            </div>
                          ))}
                          {action.actions.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{action.actions.length - 2} more actions...
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Review Panel */}
            <div>
              {selectedAction ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-amber-400">Review Action</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Player</p>
                      <p className="font-medium">{selectedAction.playerName}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400 mb-1">Deity & Race</p>
                      <p>{selectedAction.deity.name} ({selectedAction.deity.domain})</p>
                      <p>{selectedAction.race.name}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400 mb-1">Actions</p>
                      <div className="space-y-2">
                        {selectedAction.actions.map((action, idx) => (
                          <div key={idx} className="text-sm border rounded p-2">
                            <div className="font-medium text-amber-400">{action.actionId}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Timestamp: {new Date(action.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400 mb-2">Decision</p>
                      <Select value={reviewDecision} onValueChange={(value: any) => setReviewDecision(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">Approve</SelectItem>
                          <SelectItem value="modified">Approve with Modifications</SelectItem>
                          <SelectItem value="rejected">Reject</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400 mb-2">GM Notes</p>
                      <Textarea
                        value={gmNotes}
                        onChange={(e) => setGmNotes(e.target.value)}
                        placeholder="Add notes for the player..."
                        rows={3}
                      />
                    </div>

                    <Button onClick={handleReviewAction} className="w-full">
                      Submit Review
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-gray-400">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Select an action to review</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-6">
          <h3 className="text-xl font-semibold text-amber-400">Conflict Resolution</h3>
          
          {conflicts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-400">
                <Sword className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No active conflicts</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {conflicts.map(conflict => (
                <Card key={conflict.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{conflict.conflictType} Conflict</span>
                      <Badge variant={conflict.status === 'pending' ? 'destructive' : 'default'}>
                        {conflict.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Involved Players</p>
                        <div className="flex flex-wrap gap-2">
                          {conflict.involvedPlayers.map(player => (
                            <Badge key={player.playerId} variant="secondary">
                              {player.playerName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {conflict.status === 'resolved' && conflict.gmDecision && (
                        <div className="bg-gray-800 p-3 rounded">
                          <p className="text-sm text-gray-400 mb-1">GM Decision</p>
                          <p>{conflict.gmDecision.outcome}</p>
                          <p className="text-xs text-gray-500 mt-1">{conflict.gmDecision.reasoning}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <h3 className="text-xl font-semibold text-amber-400">World Events Management</h3>
          
          <Card>
            <CardContent className="p-8 text-center text-gray-400">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Event generation tools coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <h3 className="text-xl font-semibold text-amber-400">Turn Analytics</h3>
          
          {statistics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Player Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Players:</span>
                      <span>{statistics.totalPlayers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Actions Submitted:</span>
                      <span>{statistics.actionsSubmitted}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {statistics.mostPopularActions.map((action: any, idx: number) => (
                      <div key={idx} className="flex justify-between">
                        <span>{action.actionId}:</span>
                        <span>{action.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Conflicts:</span>
                      <span>{statistics.conflictsGenerated}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Events:</span>
                      <span>{statistics.eventsTriggered}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-400">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No analytics data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}