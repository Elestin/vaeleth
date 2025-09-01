import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sword, Crown, Users, Scroll } from 'lucide-react';
import { getWorldEvents } from '@/services/database';
import { WorldEvent } from '@/types';
import { useUI } from '@/store';

const Timeline: React.FC = () => {
  const [events, setEvents] = useState<WorldEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setError } = useUI();
  
  useEffect(() => {
    loadWorldEvents();
  }, []);
  
  const loadWorldEvents = async () => {
    try {
      setIsLoading(true);
      const worldEvents = await getWorldEvents(50);
      setEvents(worldEvents);
    } catch (error) {
      setError('Failed to load world events');
      console.error('Error loading world events:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getEventIcon = (type: WorldEvent['type']) => {
    switch (type) {
      case 'conflict': return Sword;
      case 'exploration': return Clock;
      case 'discovery': return Scroll;
      case 'diplomatic': return Crown;
      case 'natural': return Users;
      default: return Clock;
    }
  };
  
  const getEventColor = (type: WorldEvent['type']) => {
    switch (type) {
      case 'conflict': return 'text-red-400 bg-red-900/30 border-red-500/50';
      case 'exploration': return 'text-blue-400 bg-blue-900/30 border-blue-500/50';
      case 'discovery': return 'text-purple-400 bg-purple-900/30 border-purple-500/50';
      case 'diplomatic': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
      case 'natural': return 'text-green-400 bg-green-900/30 border-green-500/50';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-500/50';
    }
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-fantasy-blue/90 backdrop-blur-sm rounded-lg shadow-xl p-8 border border-fantasy-purple/50">
        <div className="text-center">
          <Calendar className="mx-auto text-fantasy-gold mb-4 animate-pulse" size={48} />
          <p className="text-gray-300">Loading world timeline...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-fantasy-blue/90 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-fantasy-purple/50">
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="text-fantasy-gold" size={32} />
          <div>
            <h2 className="text-2xl font-fantasy-decorative text-fantasy-gold">
              World Timeline
            </h2>
            <p className="text-gray-300 font-fantasy">
              Chronicle of divine actions and world events
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-fantasy-dark/50 p-3 rounded-lg">
            <div className="text-fantasy-gold font-fantasy text-lg">Week 1</div>
            <div className="text-gray-400 text-sm">Current Week</div>
          </div>
          <div className="bg-fantasy-dark/50 p-3 rounded-lg">
            <div className="text-fantasy-gold font-fantasy text-lg">Spring</div>
            <div className="text-gray-400 text-sm">Season</div>
          </div>
          <div className="bg-fantasy-dark/50 p-3 rounded-lg">
            <div className="text-fantasy-gold font-fantasy text-lg">Year 1</div>
            <div className="text-gray-400 text-sm">Current Year</div>
          </div>
          <div className="bg-fantasy-dark/50 p-3 rounded-lg">
            <div className="text-fantasy-gold font-fantasy text-lg">{events.length}</div>
            <div className="text-gray-400 text-sm">Total Events</div>
          </div>
        </div>
      </div>
      
      {/* Timeline */}
      <div className="bg-fantasy-blue/90 backdrop-blur-sm rounded-lg shadow-xl border border-fantasy-purple/50">
        {events.length === 0 ? (
          <div className="p-8 text-center">
            <Scroll className="mx-auto text-fantasy-gold/50 mb-4" size={64} />
            <h3 className="text-xl font-fantasy text-fantasy-gold mb-2">
              The World Awaits
            </h3>
            <p className="text-gray-300 mb-4">
              No events have occurred yet. Begin your weekly actions to shape the world and create history.
            </p>
            <div className="bg-fantasy-dark/30 p-4 rounded-lg max-w-md mx-auto">
              <p className="text-gray-400 text-sm">
                As gods take action, their deeds will be recorded here for all to see. 
                Exploration, conflicts, discoveries, and divine interventions will all 
                become part of Vaeleth's eternal chronicle.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-6">
              {events.map((event, index) => {
                const Icon = getEventIcon(event.type);
                const colorClasses = getEventColor(event.type);
                
                return (
                  <div key={event.id} className="relative">
                    {/* Timeline line */}
                    {index < events.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-6 bg-fantasy-purple/30" />
                    )}
                    
                    <div className="flex space-x-4">
                      {/* Event icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg border flex items-center justify-center ${colorClasses}`}>
                        <Icon size={20} />
                      </div>
                      
                      {/* Event content */}
                      <div className="flex-1 bg-fantasy-dark/30 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-fantasy text-white text-lg">
                            {event.title}
                          </h4>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                            {formatDate(event.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-3">
                          {event.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${colorClasses}`}>
                              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </span>
                          </div>
                          
                          {event.affectedPlayers.length > 0 && (
                            <div className="text-xs text-gray-400">
                              Affected: {event.affectedPlayers.length} player{event.affectedPlayers.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {events.length >= 50 && (
              <div className="mt-6 text-center">
                <button 
                  onClick={loadWorldEvents}
                  className="text-fantasy-gold hover:text-yellow-300 text-sm font-fantasy transition-colors"
                >
                  Load More Events
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;