import { ref, set, get, onValue, off } from 'firebase/database';
import { database } from './firebase';
import { TutorialProgress, GuestSession } from '@/types/tutorial';
import tutorialData from '@/data/tutorials.json';

export class TutorialService {
  private progressRef: (userId: string) => any;
  
  constructor() {
    this.progressRef = (userId: string) => ref(database, `tutorialProgress/${userId}`);
  }

  async startTutorial(userId: string, _tutorialType: string = 'complete-game'): Promise<void> {
    const progress: TutorialProgress = {
      userId,
      currentStep: 0,
      completedSteps: [],
      isActive: true,
      startedAt: Date.now(),
      lastInteraction: Date.now()
    };

    await set(this.progressRef(userId), progress);
  }

  async getTutorialProgress(userId: string): Promise<TutorialProgress | null> {
    const snapshot = await get(this.progressRef(userId));
    return snapshot.exists() ? snapshot.val() : null;
  }

  async updateTutorialStep(userId: string, stepId: string, completed: boolean = true): Promise<void> {
    const progress = await this.getTutorialProgress(userId);
    if (!progress) return;

    if (completed && !progress.completedSteps.includes(stepId)) {
      progress.completedSteps.push(stepId);
    }

    progress.currentStep = Math.max(0, progress.currentStep + (completed ? 1 : 0));
    progress.lastInteraction = Date.now();

    // Check if tutorial is complete
    const tutorial = tutorialData['complete-game' as keyof typeof tutorialData];
    if (progress.completedSteps.length >= tutorial.steps.length) {
      progress.isActive = false;
    }

    await set(this.progressRef(userId), progress);
  }

  async skipTutorial(userId: string): Promise<void> {
    const progress = await this.getTutorialProgress(userId);
    if (progress) {
      progress.isActive = false;
      progress.lastInteraction = Date.now();
      await set(this.progressRef(userId), progress);
    }
  }

  async resetTutorial(userId: string): Promise<void> {
    await this.startTutorial(userId, 'complete-game');
  }

  getCurrentStep(progress: TutorialProgress | null) {
    if (!progress || !progress.isActive) return null;
    
    const tutorial = tutorialData['complete-game' as keyof typeof tutorialData];
    return tutorial.steps[progress.currentStep] || null;
  }

  getStepById(stepId: string) {
    const tutorial = tutorialData['complete-game' as keyof typeof tutorialData];
    return tutorial.steps.find(step => step.id === stepId) || null;
  }

  // Subscribe to tutorial progress changes
  subscribeToTutorialProgress(userId: string, callback: (progress: TutorialProgress | null) => void) {
    const progressRef = this.progressRef(userId);
    
    const unsubscribe = onValue(progressRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() : null);
    });
    
    return () => off(progressRef, 'value', unsubscribe);
  }
}

export class GuestModeService {
  private guestRef = ref(database, 'guestSessions');
  
  async createGuestSession(): Promise<GuestSession> {
    const guestSession: GuestSession = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startedAt: Date.now(),
      limitations: {
        canSave: false,
        canChat: true, // Allow limited chat
        maxActions: 5, // Limited actions per session
        sessionDuration: 2 * 60 * 60 * 1000 // 2 hours
      },
      progress: {
        deityCreated: false,
        raceCreated: false,
        actionsPerformed: 0
      }
    };

    await set(ref(database, `guestSessions/${guestSession.id}`), guestSession);
    return guestSession;
  }

  async getGuestSession(sessionId: string): Promise<GuestSession | null> {
    const snapshot = await get(ref(database, `guestSessions/${sessionId}`));
    return snapshot.exists() ? snapshot.val() : null;
  }

  async updateGuestProgress(sessionId: string, updates: Partial<GuestSession['progress']>): Promise<void> {
    const session = await this.getGuestSession(sessionId);
    if (session) {
      session.progress = { ...session.progress, ...updates };
      await set(ref(database, `guestSessions/${sessionId}`), session);
    }
  }

  isSessionExpired(session: GuestSession): boolean {
    return Date.now() - session.startedAt > session.limitations.sessionDuration;
  }

  canPerformAction(session: GuestSession): boolean {
    return session.progress.actionsPerformed < session.limitations.maxActions;
  }

  async cleanupExpiredSessions(): Promise<void> {
    // This would be run periodically to clean up old guest sessions
    const snapshot = await get(this.guestRef);
    if (snapshot.exists()) {
      const sessions = snapshot.val();
      
      for (const [sessionId, session] of Object.entries(sessions as Record<string, GuestSession>)) {
        if (this.isSessionExpired(session)) {
          await set(ref(database, `guestSessions/${sessionId}`), null);
        }
      }
    }
  }
}

export const tutorialService = new TutorialService();
export const guestModeService = new GuestModeService();