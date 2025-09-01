import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Users, Crown } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { sendChatMessage, subscribeToChat } from '@/services/database';
import { ChatMessage } from '@/types';
import { useAppStore } from '@/store';

const DiscussionBoard: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { currentUser, deity, setError } = useAppStore();
  
  useEffect(() => {
    // Subscribe to real-time chat updates
    const unsubscribe = subscribeToChat((chatMessages) => {
      setMessages(chatMessages);
      scrollToBottom();
    });
    
    return unsubscribe;
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !deity || !newMessage.trim()) return;
    
    setIsSending(true);
    
    try {
      const message: Omit<ChatMessage, 'id'> = {
        userId: currentUser.uid,
        userName: deity.name,
        content: newMessage.trim(),
        timestamp: Date.now(),
        type: 'public'
      };
      
      await sendChatMessage(message);
      setNewMessage('');
      
    } catch (error) {
      setError('Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };
  
  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const dateKey = new Date(message.timestamp).toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-fantasy-blue/90 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-fantasy-purple/50">
        <div className="flex items-center space-x-3 mb-4">
          <MessageSquare className="text-fantasy-gold" size={32} />
          <div>
            <h2 className="text-2xl font-fantasy-decorative text-fantasy-gold">
              Divine Council
            </h2>
            <p className="text-gray-300 font-fantasy">
              Communicate with other deities across the realm
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-fantasy-dark/50 p-3 rounded-lg text-center">
            <div className="text-fantasy-gold font-fantasy text-lg">
              {messages.length}
            </div>
            <div className="text-gray-400 text-sm">Total Messages</div>
          </div>
          <div className="bg-fantasy-dark/50 p-3 rounded-lg text-center">
            <div className="text-fantasy-gold font-fantasy text-lg">
              {new Set(messages.map(m => m.userId)).size}
            </div>
            <div className="text-gray-400 text-sm">Active Deities</div>
          </div>
          <div className="bg-fantasy-dark/50 p-3 rounded-lg text-center">
            <div className="text-fantasy-gold font-fantasy text-lg">Public</div>
            <div className="text-gray-400 text-sm">Channel Type</div>
          </div>
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="bg-fantasy-blue/90 backdrop-blur-sm rounded-lg shadow-xl border border-fantasy-purple/50 flex flex-col" style={{ height: '500px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.keys(groupedMessages).length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-fantasy-gold/50 mb-4" size={64} />
              <h3 className="text-xl font-fantasy text-fantasy-gold mb-2">
                Divine Silence
              </h3>
              <p className="text-gray-300 mb-4">
                No messages yet. Be the first to speak in the divine council.
              </p>
              <div className="bg-fantasy-dark/30 p-4 rounded-lg max-w-md mx-auto">
                <p className="text-gray-400 text-sm">
                  Here you can discuss strategies, form alliances, declare wars, 
                  or simply engage in divine discourse with other players.
                </p>
              </div>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([dateKey, dayMessages]) => (
              <div key={dateKey} className="space-y-3">
                {/* Date separator */}
                <div className="flex items-center justify-center">
                  <div className="bg-fantasy-dark/50 px-3 py-1 rounded-full">
                    <span className="text-gray-400 text-xs font-fantasy">
                      {formatDate(dayMessages[0].timestamp)}
                    </span>
                  </div>
                </div>
                
                {/* Messages for this day */}
                {dayMessages.map((message) => {
                  const isOwnMessage = message.userId === currentUser?.uid;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage 
                          ? 'bg-fantasy-gold text-fantasy-dark' 
                          : 'bg-fantasy-dark/50 text-white'
                      }`}>
                        {!isOwnMessage && (
                          <div className="flex items-center space-x-2 mb-1">
                            <Crown size={14} className="text-fantasy-gold" />
                            <span className="text-xs font-fantasy font-medium text-fantasy-gold">
                              {message.userName}
                            </span>
                          </div>
                        )}
                        <div className="text-sm">{message.content}</div>
                        <div className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-fantasy-dark/70' : 'text-gray-400'
                        }`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        <div className="border-t border-fantasy-purple/30 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <div className="flex-1">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Speak your divine will..."
                disabled={isSending}
                className="mb-0"
                maxLength={500}
              />
            </div>
            <Button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              loading={isSending}
              className="px-4"
            >
              <Send size={18} />
            </Button>
          </form>
          
          <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
            <span>
              {deity ? `Speaking as ${deity.name}` : 'Anonymous'}
            </span>
            <span>
              {newMessage.length}/500
            </span>
          </div>
        </div>
      </div>
      
      {/* Chat Guidelines */}
      <div className="bg-fantasy-blue/90 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-fantasy-purple/50">
        <h3 className="text-lg font-fantasy text-fantasy-gold mb-4">Divine Etiquette</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <h4 className="font-fantasy text-white mb-2">Encouraged:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Strategic discussions and alliances</li>
              <li>Diplomatic negotiations</li>
              <li>Sharing of world events and discoveries</li>
              <li>Roleplaying your deity's personality</li>
            </ul>
          </div>
          <div>
            <h4 className="font-fantasy text-white mb-2">Remember:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>All messages are public and persistent</li>
              <li>Be respectful to other players</li>
              <li>Keep discussions game-related</li>
              <li>Your reputation affects diplomacy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionBoard;