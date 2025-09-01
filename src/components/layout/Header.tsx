import React from 'react';
import { Crown, LogOut, Settings } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth, useGameProgress } from '@/store';
import { useAuthHook } from '@/hooks/useAuth';

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { user } = useAuth();
  const { deity } = useGameProgress();
  const { logout } = useAuthHook();
  
  if (!user) return null;
  
  return (
    <header className="bg-fantasy-blue/95 backdrop-blur-sm border-b border-fantasy-purple/50 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <Crown className="text-fantasy-gold" size={32} />
          <div>
            <h1 className="text-xl font-fantasy-decorative text-fantasy-gold">
              Vaeleth
            </h1>
            {deity && (
              <p className="text-sm text-gray-300 font-fantasy">
                {deity.name}, God of {deity.domain}
              </p>
            )}
          </div>
        </div>
        
        {/* User Info and Actions */}
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-fantasy text-gray-300">
              {user.displayName || user.email}
            </p>
            <p className="text-xs text-gray-400">
              Divine Ruler
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              title="Settings"
              onClick={onOpenSettings}
            >
              <Settings size={18} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              title="Logout"
              onClick={logout}
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;