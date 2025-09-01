import React from 'react';
import { Volume2, Eye, RotateCcw } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useAuthHook } from '@/hooks/useAuth';
import { tutorialService } from '@/services/tutorialService';
import { useAuth } from '@/store';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuthHook();
  const { user } = useAuth();

  const handleResetTutorial = async () => {
    if (user) {
      await tutorialService.resetTutorial(user.uid);
      onClose();
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      size="md"
    >
      <div className="space-y-6">
        {/* Tutorial Section */}
        <div>
          <h4 className="text-fantasy-gold font-fantasy mb-3">Tutorial</h4>
          <div className="space-y-2">
            <Button
              onClick={handleResetTutorial}
              variant="ghost"
              className="w-full justify-start"
            >
              <RotateCcw size={18} className="mr-2" />
              Restart Tutorial
            </Button>
            <p className="text-xs text-gray-400">
              This will reset your tutorial progress and start from the beginning.
            </p>
          </div>
        </div>

        {/* Game Settings */}
        <div>
          <h4 className="text-fantasy-gold font-fantasy mb-3">Game Settings</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-fantasy-dark/50 rounded">
              <div className="flex items-center space-x-3">
                <Volume2 size={18} className="text-gray-400" />
                <span className="text-gray-300">Sound Effects</span>
              </div>
              <div className="text-gray-500 text-sm">Coming Soon</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-fantasy-dark/50 rounded">
              <div className="flex items-center space-x-3">
                <Eye size={18} className="text-gray-400" />
                <span className="text-gray-300">Animations</span>
              </div>
              <div className="text-gray-500 text-sm">Coming Soon</div>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div>
          <h4 className="text-fantasy-gold font-fantasy mb-3">Account</h4>
          <div className="space-y-2">
            <div className="p-3 bg-fantasy-dark/30 rounded">
              <p className="text-sm text-gray-300">Logged in as:</p>
              <p className="text-fantasy-gold">{user?.email}</p>
            </div>
            
            <Button
              onClick={handleLogout}
              variant="danger"
              className="w-full justify-start border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <Eye size={18} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-fantasy-purple/30">
          <p className="text-center text-xs text-gray-500">
            Vaeleth v2.0 • Divine Realm Management
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;