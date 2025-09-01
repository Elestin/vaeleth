export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'input' | 'navigate' | 'wait';
  nextTrigger?: 'auto' | 'click' | 'custom';
  skippable: boolean;
  highlightElement?: boolean;
  overlay?: boolean;
}

export interface TutorialProgress {
  userId?: string;
  currentStep: number;
  completedSteps: string[];
  isActive: boolean;
  startedAt: number;
  lastInteraction: number;
}

export interface GuestSession {
  id: string;
  startedAt: number;
  limitations: {
    canSave: false;
    canChat: boolean;
    maxActions: number;
    sessionDuration: number; // in milliseconds
  };
  progress: {
    deityCreated: boolean;
    raceCreated: boolean;
    actionsPerformed: number;
  };
}

export type TutorialType = 'deity-creation' | 'race-creation' | 'weekly-actions' | 'world-map' | 'complete-game';