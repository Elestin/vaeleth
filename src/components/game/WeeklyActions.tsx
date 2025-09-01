import React, { useState } from 'react';
import { Swords, Plus, X, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { useAppStore, useResources } from '@/store';
import { submitWeeklyActions, updatePlayerResources } from '@/services/database';
import { WeeklyAction, GameAction, PlayerResources } from '@/types';
import actionsData from '@/data/actions.json';

const WeeklyActions: React.FC = () => {
  const [selectedActions, setSelectedActions] = useState<WeeklyAction[]>([]);
  const [selectedActionId, setSelectedActionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { currentUser, deity, setError } = useAppStore();
  const { resources, updateResources } = useResources();
  
  console.log('Current resources:', resources);
  
  const actions: GameAction[] = actionsData.actions;
  
  const availableActions = actions.filter(action =>
    !selectedActions.some(selected => selected.actionId === action.id)
  );
  
  const actionOptions = [
    { value: '', label: 'Select an action...' },
    ...availableActions.map(action => ({
      value: action.id,
      label: action.name
    }))
  ];
  
  const selectedAction = selectedActionId ? 
    actions.find(action => action.id === selectedActionId) : null;
  
  // Map short resource names to full resource names
  const resourceMapping: Record<string, keyof PlayerResources> = {
    'action': 'actionPoints',
    'wealth': 'wealthPoints', 
    'magic': 'magicPoints',
    'influence': 'influencePoints',
    'command': 'commandPoints'
  };

  // Calculate if player can afford the selected action
  const canAffordAction = selectedAction ? 
    Object.entries(selectedAction.costs).every(([resource, cost]) => {
      const resourceKey = resourceMapping[resource] || resource as keyof PlayerResources;
      const currentAmount = resources[resourceKey] || 0;
      console.log(`Checking resource ${resource} (${resourceKey}): has ${currentAmount}, needs ${cost}`);
      return currentAmount >= cost;
    }) : false;
  
  // Calculate total resource costs for all selected actions
  const totalCosts = selectedActions.reduce((total, weeklyAction) => {
    const action = actions.find(a => a.id === weeklyAction.actionId);
    if (!action) return total;
    
    Object.entries(action.costs).forEach(([resource, cost]) => {
      const resourceKey = resourceMapping[resource] || resource;
      total[resourceKey] = (total[resourceKey] || 0) + cost;
    });
    
    return total;
  }, {} as Record<string, number>);
  
  const handleAddAction = () => {
    if (selectedAction && canAffordAction) {
      const weeklyAction: WeeklyAction = {
        actionId: selectedAction.id,
        timestamp: Date.now()
      };
      
      setSelectedActions([...selectedActions, weeklyAction]);
      setSelectedActionId('');
    }
  };
  
  const handleRemoveAction = (index: number) => {
    setSelectedActions(selectedActions.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || selectedActions.length === 0) {
      setError('You must select at least one action');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Submit actions
      await submitWeeklyActions(currentUser.uid, selectedActions);
      
      // Deduct resources
      const newResources = { ...resources };
      Object.entries(totalCosts).forEach(([resource, cost]) => {
        if (newResources[resource as keyof typeof newResources] !== undefined) {
          newResources[resource as keyof typeof newResources] -= cost;
        }
      });
      
      await updatePlayerResources(currentUser.uid, newResources);
      updateResources(newResources);
      
      // Clear selected actions
      setSelectedActions([]);
      
      // Show success message
      setError('Actions submitted successfully! Results will be processed at turn resolution.');
      
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-fantasy-blue/90 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-fantasy-purple/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Swords className="text-fantasy-gold" size={32} />
            <div>
              <h2 className="text-2xl font-fantasy-decorative text-fantasy-gold">
                Weekly Actions
              </h2>
              {deity && (
                <p className="text-gray-300 font-fantasy">
                  {deity.name}, God of {deity.domain}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Week 1, Spring Year 1</p>
            <p className="text-xs text-gray-500">Turn resolves in 6d 14h 32m</p>
          </div>
        </div>
        
        {/* Resource Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-fantasy-dark/50 p-3 rounded-lg text-center">
            <div className="text-fantasy-gold font-fantasy text-lg">{resources.actionPoints}</div>
            <div className="text-gray-400 text-sm">Action Points</div>
          </div>
          <div className="bg-fantasy-dark/50 p-3 rounded-lg text-center">
            <div className="text-fantasy-gold font-fantasy text-lg">{resources.wealthPoints}</div>
            <div className="text-gray-400 text-sm">Wealth</div>
          </div>
          <div className="bg-fantasy-dark/50 p-3 rounded-lg text-center">
            <div className="text-fantasy-gold font-fantasy text-lg">{resources.magicPoints}</div>
            <div className="text-gray-400 text-sm">Magic</div>
          </div>
          <div className="bg-fantasy-dark/50 p-3 rounded-lg text-center">
            <div className="text-fantasy-gold font-fantasy text-lg">{resources.influencePoints}</div>
            <div className="text-gray-400 text-sm">Influence</div>
          </div>
          <div className="bg-fantasy-dark/50 p-3 rounded-lg text-center">
            <div className="text-fantasy-gold font-fantasy text-lg">{resources.commandPoints}</div>
            <div className="text-gray-400 text-sm">Command</div>
          </div>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Action Selection */}
        <div className="bg-fantasy-blue/90 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-fantasy-purple/50">
          <h3 className="text-xl font-fantasy text-fantasy-gold mb-4">
            Plan Your Actions
          </h3>
          
          <div className="space-y-4">
            <Select
              label="Choose Action"
              value={selectedActionId}
              onChange={(e) => setSelectedActionId(e.target.value)}
              options={actionOptions}
            />
            
            {selectedAction && (
              <div className="bg-fantasy-dark/30 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-fantasy-gold font-medium">{selectedAction.name}</h5>
                  <div className={`text-sm ${canAffordAction ? 'text-green-400' : 'text-red-400'}`}>
                    {canAffordAction ? 'Affordable' : 'Insufficient Resources'}
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm">{selectedAction.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedAction.costs).map(([resource, cost]) => {
                    const displayName = resource.charAt(0).toUpperCase() + resource.slice(1);
                    const resourceKey = resourceMapping[resource] || resource as keyof PlayerResources;
                    const currentAmount = resources[resourceKey] || 0;
                    const hasEnough = currentAmount >= cost;
                    
                    return (
                      <span 
                        key={resource}
                        className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                          hasEnough ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'
                        }`}
                      >
                        {cost} {displayName} ({currentAmount})
                      </span>
                    );
                  })}
                </div>
                
                <Button
                  onClick={handleAddAction}
                  disabled={!canAffordAction}
                  size="sm"
                  className="w-full"
                >
                  <Plus size={16} className="mr-2" />
                  Add Action
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column - Selected Actions */}
        <div className="bg-fantasy-blue/90 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-fantasy-purple/50">
          <h3 className="text-xl font-fantasy text-fantasy-gold mb-4">
            Planned Actions ({selectedActions.length})
          </h3>
          
          {selectedActions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Zap size={48} className="mx-auto mb-4 opacity-50" />
              <p>No actions planned</p>
              <p className="text-sm">Select actions to execute this week</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedActions.map((weeklyAction, index) => {
                const action = actions.find(a => a.id === weeklyAction.actionId);
                if (!action) return null;
                
                return (
                  <div key={index} className="bg-fantasy-dark/30 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-fantasy text-white">{action.name}</h5>
                      <button
                        onClick={() => handleRemoveAction(index)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        title="Remove action"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{action.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(action.costs).map(([resource, cost]) => {
                        const displayName = resource.charAt(0).toUpperCase() + resource.slice(1);
                        return (
                          <span 
                            key={resource}
                            className="inline-flex items-center px-2 py-1 bg-fantasy-purple/30 rounded text-xs text-white"
                          >
                            -{cost} {displayName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
              {/* Total Cost Summary */}
              {Object.keys(totalCosts).length > 0 && (
                <div className="border-t border-fantasy-purple/30 pt-4">
                  <h6 className="text-fantasy-gold font-medium mb-2">Total Cost:</h6>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(totalCosts).map(([resource, cost]) => {
                      // Convert mapped resource names back to display names
                      const displayName = resource.includes('Points') ? 
                        resource.replace('Points', '') : 
                        resource.charAt(0).toUpperCase() + resource.slice(1);
                      
                      return (
                        <span 
                          key={resource}
                          className="inline-flex items-center px-2 py-1 bg-red-900/30 border border-red-500/50 rounded text-xs text-white"
                        >
                          -{cost} {displayName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {selectedActions.length > 0 && (
            <form onSubmit={handleSubmit} className="mt-6">
              <Button
                type="submit"
                className="w-full"
                loading={isSubmitting}
                disabled={selectedActions.length === 0 || isSubmitting}
              >
                Execute Weekly Actions
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyActions;