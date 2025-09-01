import React from 'react';
import { 
  Crown, 
  Users, 
  Swords, 
  Calendar, 
  Map, 
  MessageSquare,
  Shield,
  Lock 
} from 'lucide-react';
import { GameTab } from '@/types';
import { useNavigation, useGameProgress } from '@/store';

const TabNavigation: React.FC = () => {
  const { currentTab, setCurrentTab } = useNavigation();
  const { hasDeity, hasRace, canAccessGame } = useGameProgress();
  
  const tabs = [
    {
      id: 'deityCreator' as GameTab,
      name: 'Deity Creator',
      icon: Crown,
      enabled: true,
      visible: !hasDeity
    },
    {
      id: 'raceCreator' as GameTab,
      name: 'Race Creator', 
      icon: Users,
      enabled: hasDeity,
      visible: hasDeity && !hasRace
    },
    {
      id: 'weeklyActions' as GameTab,
      name: 'Weekly Actions',
      icon: Swords,
      enabled: canAccessGame,
      visible: canAccessGame
    },
    {
      id: 'timeline' as GameTab,
      name: 'Timeline',
      icon: Calendar,
      enabled: canAccessGame,
      visible: canAccessGame
    },
    {
      id: 'worldMap' as GameTab,
      name: 'World Map',
      icon: Map,
      enabled: canAccessGame,
      visible: canAccessGame
    },
    {
      id: 'discussionBoard' as GameTab,
      name: 'Discussion',
      icon: MessageSquare,
      enabled: canAccessGame,
      visible: canAccessGame
    },
    {
      id: 'gameMaster' as GameTab,
      name: 'Game Master',
      icon: Shield,
      enabled: canAccessGame,
      visible: canAccessGame
    }
  ];
  
  const visibleTabs = tabs.filter(tab => tab.visible);
  
  return (
    <nav className="bg-fantasy-dark/50 border-b border-fantasy-purple/30 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            const isEnabled = tab.enabled;
            
            return (
              <button
                key={tab.id}
                onClick={() => isEnabled && setCurrentTab(tab.id)}
                disabled={!isEnabled}
                className={`
                  flex items-center space-x-2 px-4 py-3 text-sm font-fantasy whitespace-nowrap
                  transition-colors duration-200 border-b-2 min-w-max
                  ${isActive 
                    ? 'border-fantasy-gold text-fantasy-gold bg-fantasy-blue/30' 
                    : 'border-transparent text-gray-300 hover:text-fantasy-gold hover:bg-fantasy-blue/20'
                  }
                  ${!isEnabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
                title={!isEnabled ? 'Complete previous steps to unlock' : ''}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.name}</span>
                {!isEnabled && <Lock size={14} className="text-gray-500" />}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default TabNavigation;