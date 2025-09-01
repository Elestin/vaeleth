import React from 'react';
import Header from './Header';
import TabNavigation from './TabNavigation';
import { useAuth } from '@/store';

interface LayoutProps {
  children: React.ReactNode;
  onOpenSettings: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onOpenSettings }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-fantasy-dark">
      {/* Fantasy Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'url("/images/fantasy-background.jpg")',
        }}
        aria-hidden="true"
      />
      
      {/* Main Layout */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {isAuthenticated && <Header onOpenSettings={onOpenSettings} />}
        {isAuthenticated && <TabNavigation />}
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        {isAuthenticated && (
          <footer className="bg-fantasy-dark/80 border-t border-fantasy-purple/30 px-4 py-3">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-xs text-gray-400 font-fantasy">
                Shape the world through divine will • Vaeleth v2.0
              </p>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default Layout;