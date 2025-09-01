import React, { useState, useEffect } from 'react';
import { Users, Plus, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAppStore } from '@/store';
import { createRace } from '@/services/database';
import { Characteristic } from '@/types';
import characteristicsData from '@/data/characteristics.json';

const RaceCreator: React.FC = () => {
  const [raceName, setRaceName] = useState('');
  const [selectedCharacteristics, setSelectedCharacteristics] = useState<Characteristic[]>([]);
  const [selectedCharId, setSelectedCharId] = useState('');
  const [pointsRemaining, setPointsRemaining] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { currentUser, setRace, setError, getNextAvailableTab, setCurrentTab } = useAppStore();
  
  const characteristics: Characteristic[] = characteristicsData.characteristics as Characteristic[];
  
  // Calculate points remaining
  useEffect(() => {
    const pointsUsed = selectedCharacteristics.reduce((total, char) => total + char.cost, 0);
    setPointsRemaining(100 - pointsUsed);
  }, [selectedCharacteristics]);
  
  const availableCharacteristics = characteristics.filter(char => 
    !selectedCharacteristics.some(selected => selected.id === char.id)
  );
  
  const characteristicOptions = [
    { value: '', label: 'Select a characteristic...' },
    ...availableCharacteristics.map(char => ({
      value: char.id,
      label: `${char.name} (${char.cost >= 0 ? '+' : ''}${char.cost} points)`
    }))
  ];
  
  const selectedCharacteristic = selectedCharId ? 
    characteristics.find(char => char.id === selectedCharId) : null;
  
  const canAddCharacteristic = selectedCharacteristic && 
    pointsRemaining >= selectedCharacteristic.cost &&
    !selectedCharacteristics.some(char => char.id === selectedCharacteristic.id);
  
  const handleAddCharacteristic = () => {
    if (canAddCharacteristic && selectedCharacteristic) {
      setSelectedCharacteristics([...selectedCharacteristics, selectedCharacteristic]);
      setSelectedCharId('');
    }
  };
  
  const handleRemoveCharacteristic = (charId: string) => {
    setSelectedCharacteristics(selectedCharacteristics.filter(char => char.id !== charId));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to create a race');
      return;
    }
    
    if (selectedCharacteristics.length === 0) {
      setError('You must select at least one characteristic');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const race = {
        name: raceName.trim(),
        characteristics: selectedCharacteristics,
        pointsUsed: 100 - pointsRemaining
      };
      
      await createRace(currentUser.uid, race);
      
      // Update local state
      setRace({
        ...race,
        userId: currentUser.uid,
        createdAt: Date.now()
      });
      
      // Navigate to next step
      const nextTab = getNextAvailableTab();
      setCurrentTab(nextTab);
      
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto bg-fantasy-blue/90 backdrop-blur-sm rounded-lg shadow-xl p-8 border border-fantasy-purple/50">
      <div className="text-center mb-8">
        <Users className="mx-auto text-fantasy-gold mb-4" size={48} />
        <h2 className="text-3xl font-fantasy-decorative text-fantasy-gold mb-2">
          Create Your Fantasy Race
        </h2>
        <p className="text-gray-300 font-fantasy">
          Design the beings that will carry out your divine will
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Race Creation */}
          <div className="space-y-6">
            <Input
              label="Race Name"
              value={raceName}
              onChange={(e) => setRaceName(e.target.value)}
              placeholder="Enter your race name"
              required
              helperText="What will you call your divine creations?"
            />
            
            <div className="bg-fantasy-dark/50 p-4 rounded-lg border border-fantasy-purple/30">
              <h4 className="text-fantasy-gold font-fantasy font-medium mb-2">
                Points Remaining: {pointsRemaining}
              </h4>
              <div className="w-full bg-fantasy-purple/30 rounded-full h-2">
                <div 
                  className="bg-fantasy-gold h-2 rounded-full transition-all duration-300"
                  style={{ width: `${100 - pointsRemaining}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <Select
                label="Add Characteristic"
                value={selectedCharId}
                onChange={(e) => setSelectedCharId(e.target.value)}
                options={characteristicOptions}
              />
              
              {selectedCharacteristic && (
                <div className="bg-fantasy-dark/30 p-4 rounded-lg">
                  <h5 className="text-fantasy-gold font-medium mb-2">
                    {selectedCharacteristic.name} ({selectedCharacteristic.cost >= 0 ? '+' : ''}{selectedCharacteristic.cost} points)
                  </h5>
                  <p className="text-gray-300 text-sm mb-3">
                    {selectedCharacteristic.description}
                  </p>
                  <Button
                    type="button"
                    onClick={handleAddCharacteristic}
                    disabled={!canAddCharacteristic}
                    size="sm"
                    className="w-full"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Characteristic
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Selected Characteristics */}
          <div className="space-y-4">
            <h4 className="text-fantasy-gold font-fantasy font-medium text-lg">
              Selected Characteristics
            </h4>
            
            {selectedCharacteristics.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No characteristics selected yet</p>
                <p className="text-sm">Choose traits to define your race</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedCharacteristics.map((char) => (
                  <div 
                    key={char.id}
                    className={`p-4 rounded-lg border ${
                      char.type === 'positive' 
                        ? 'bg-green-900/30 border-green-500/50' 
                        : 'bg-red-900/30 border-red-500/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-fantasy font-medium text-white">
                        {char.name}
                      </h5>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${
                          char.cost >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {char.cost >= 0 ? '+' : ''}{char.cost}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCharacteristic(char.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                          title="Remove characteristic"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">
                      {char.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
          disabled={!raceName.trim() || selectedCharacteristics.length === 0 || isSubmitting}
        >
          Create the {raceName || 'Race'}
        </Button>
      </form>
    </div>
  );
};

export default RaceCreator;