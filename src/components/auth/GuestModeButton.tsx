import React, { useState } from 'react';
import { Play, Clock, MessageCircle, Zap, Info } from 'lucide-react';
import Button from '@/components/ui/Button';
import { guestModeService } from '@/services/tutorialService';
import { GuestSession } from '@/types/tutorial';

interface GuestModeButtonProps {
  onGuestSessionStart: (session: GuestSession) => void;
}

const GuestModeButton: React.FC<GuestModeButtonProps> = ({ onGuestSessionStart }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleStartGuestMode = async () => {
    setIsCreating(true);
    
    try {
      const session = await guestModeService.createGuestSession();
      onGuestSessionStart(session);
    } catch (error) {
      console.error('Failed to create guest session:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleStartGuestMode}
        loading={isCreating}
        variant="ghost"
        className="w-full border-2 border-fantasy-gold/30 hover:border-fantasy-gold/50 bg-transparent"
      >
        <Play size={18} className="mr-2" />
        Try as Guest
      </Button>
      
      <div className="mt-3">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-center w-full text-xs text-gray-400 hover:text-gray-300 transition-colors"
        >
          <Info size={14} className="mr-1" />
          What's included in guest mode?
        </button>
        
        {showDetails && (
          <div className="mt-3 p-4 bg-fantasy-dark/30 rounded-lg border border-fantasy-purple/20">
            <h4 className="text-fantasy-gold font-medium text-sm mb-3">
              Guest Mode Features
            </h4>
            
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span>Full tutorial experience</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span>Create deity and race</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span>Explore interactive world map</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span>
                  <Zap size={12} className="inline mr-1" />
                  5 weekly actions maximum
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span>
                  <MessageCircle size={12} className="inline mr-1" />
                  Limited chat access
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full" />
                <span>
                  <Clock size={12} className="inline mr-1" />
                  2-hour session limit
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full" />
                <span>Progress not saved permanently</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-fantasy-blue/20 rounded border border-fantasy-blue/30">
              <p className="text-xs text-gray-400">
                <strong className="text-fantasy-gold">Ready to rule forever?</strong> Create an account to save your progress, unlock unlimited actions, and participate in the full multiplayer experience.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestModeButton;