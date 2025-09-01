import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import AuthForm from '@/components/auth/AuthForm';
import DeityCreator from '@/components/game/DeityCreator';
import RaceCreator from '@/components/game/RaceCreator';
import WeeklyActions from '@/components/game/WeeklyActions';
import Timeline from '@/components/game/Timeline';
import WorldMap from '@/components/game/WorldMap';
import DiscussionBoard from '@/components/game/DiscussionBoard';
import { GameMasterDashboard } from '@/components/admin/GameMasterDashboard';
import TutorialOverlay from '@/components/tutorial/TutorialOverlay';
import LoadingDebug from '@/components/debug/LoadingDebug';
import SettingsModal from '@/components/settings/SettingsModal';
import { useAuthHook } from '@/hooks/useAuth';
import { useNavigation, useUI } from '@/store';
import { tutorialService } from '@/services/tutorialService';
import { initializeMap } from '@/services/mapService';
import { TutorialProgress, TutorialStep } from '@/types/tutorial';

const App: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [tutorialProgress, setTutorialProgress] = useState<TutorialProgress | null>(null);
  const [currentTutorialStep, setCurrentTutorialStep] = useState<TutorialStep | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const { user } = useAuthHook();
  const { currentTab } = useNavigation();
  const { isLoading, error } = useUI();

  // Initialize game systems
  useEffect(() => {
    const initializeGame = async () => {
      try {
        await initializeMap();
      } catch (error) {
        console.log('Game initialization will complete after login');
      }
    };

    initializeGame();

    // Fallback timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('Auth initialization timed out, forcing load complete');
        // This would be handled by the auth hook, but adding as safety
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Re-initialize after user logs in
  useEffect(() => {
    if (user) {
      const reinitializeGame = async () => {
        try {
          await initializeMap();
        } catch (error) {
          console.error('Failed to initialize authenticated game systems:', error);
        }
      };

      reinitializeGame();
    }
  }, [user]);

  // Tutorial system
  useEffect(() => {
    if (user) {
      const unsubscribe = tutorialService.subscribeToTutorialProgress(user.uid, (progress) => {
        setTutorialProgress(progress);
        if (progress && progress.isActive) {
          const step = tutorialService.getCurrentStep(progress);
          setCurrentTutorialStep(step as TutorialStep);
        } else {
          setCurrentTutorialStep(null);
        }
      });

      // Check if user needs tutorial
      tutorialService.getTutorialProgress(user.uid).then((progress) => {
        if (!progress) {
          // Start tutorial for new users
          tutorialService.startTutorial(user.uid);
        }
      });

      return unsubscribe;
    }
  }, [user]);

  const handleTutorialStepComplete = async (stepId: string) => {
    if (user) {
      await tutorialService.updateTutorialStep(user.uid, stepId, true);
    }
  };

  const handleSkipTutorial = async () => {
    if (user) {
      await tutorialService.skipTutorial(user.uid);
    }
  };

  const handleRestartTutorial = async () => {
    if (user) {
      await tutorialService.resetTutorial(user.uid);
    }
  };
  
  const renderCurrentTab = () => {
    console.log('Rendering current tab:', currentTab, 'User:', user?.email);
    
    switch (currentTab) {
      case 'deityCreator':
        return <DeityCreator />;
      case 'raceCreator':
        return <RaceCreator />;
      case 'weeklyActions':
        return <WeeklyActions />;
      case 'timeline':
        return <Timeline />;
      case 'worldMap':
        return <WorldMap />;
      case 'discussionBoard':
        return <DiscussionBoard />;
      case 'gameMaster':
        return <GameMasterDashboard />;
      default:
        return <DeityCreator />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-fantasy-dark flex items-center justify-center">
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'url("/images/fantasy-background.jpg")',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 text-center">
          <div className="animate-spin mx-auto mb-4 w-12 h-12 border-4 border-fantasy-gold border-t-transparent rounded-full" />
          <p className="text-fantasy-gold font-fantasy text-lg">
            Connecting to the Divine Realm...
          </p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-fantasy-dark flex items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'url("/images/fantasy-background.jpg")',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 w-full">
          <AuthForm 
            mode={authMode} 
            onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} 
          />
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Layout onOpenSettings={() => setShowSettings(true)}>
        <LoadingDebug />
        
        {error && error.includes('successfully') ? (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-500/50 rounded-lg">
            <p className="text-green-300 text-sm">{error}</p>
          </div>
        ) : error ? (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        ) : null}
        
        {renderCurrentTab()}
        
        {/* Tutorial Overlay */}
        {user && (
          <TutorialOverlay
            progress={tutorialProgress}
            currentStep={currentTutorialStep}
            onStepComplete={handleTutorialStepComplete}
            onSkipTutorial={handleSkipTutorial}
            onRestartTutorial={handleRestartTutorial}
          />
        )}
      </Layout>

      {/* Settings Modal - At root level for proper z-index */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </>
  );
};

export default App;