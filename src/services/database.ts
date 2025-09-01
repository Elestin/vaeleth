import { ref, set, get, push, query, orderByChild, limitToLast, onValue, off } from 'firebase/database';
import { database } from './firebase';
import { Deity, Race, WeeklyAction, WorldEvent, ChatMessage, PlayerResources } from '@/types';

// Deity operations
export const createDeity = async (userId: string, deity: Omit<Deity, 'userId' | 'createdAt'>): Promise<void> => {
  const deityRef = ref(database, `deities/${userId}`);
  
  // Check if deity already exists
  const snapshot = await get(deityRef);
  if (snapshot.exists()) {
    throw new Error('Deity already exists for this user');
  }
  
  const deityData: Deity = {
    ...deity,
    userId,
    createdAt: Date.now()
  };
  
  await set(deityRef, deityData);
};

export const getDeity = async (userId: string): Promise<Deity | null> => {
  const deityRef = ref(database, `deities/${userId}`);
  const snapshot = await get(deityRef);
  
  return snapshot.exists() ? snapshot.val() : null;
};

// Race operations
export const createRace = async (userId: string, race: Omit<Race, 'userId' | 'createdAt'>): Promise<void> => {
  const raceRef = ref(database, `races/${userId}`);
  
  const raceData: Race = {
    ...race,
    userId,
    createdAt: Date.now()
  };
  
  await set(raceRef, raceData);
};

export const getRace = async (userId: string): Promise<Race | null> => {
  const raceRef = ref(database, `races/${userId}`);
  const snapshot = await get(raceRef);
  
  return snapshot.exists() ? snapshot.val() : null;
};

// Weekly actions
export const submitWeeklyActions = async (userId: string, actions: WeeklyAction[]): Promise<void> => {
  const actionsRef = ref(database, `weeklyActions/${userId}`);
  await set(actionsRef, {
    actions,
    submittedAt: Date.now(),
    week: new Date().toISOString().slice(0, 10) // YYYY-MM-DD format
  });
};

export const getWeeklyActions = async (userId: string): Promise<WeeklyAction[] | null> => {
  const actionsRef = ref(database, `weeklyActions/${userId}`);
  const snapshot = await get(actionsRef);
  
  return snapshot.exists() ? snapshot.val().actions : null;
};

// Player resources
export const updatePlayerResources = async (userId: string, resources: PlayerResources): Promise<void> => {
  const resourcesRef = ref(database, `playerResources/${userId}`);
  await set(resourcesRef, resources);
};

export const getPlayerResources = async (userId: string): Promise<PlayerResources | null> => {
  const resourcesRef = ref(database, `playerResources/${userId}`);
  const snapshot = await get(resourcesRef);
  
  if (snapshot.exists()) {
    return snapshot.val();
  }
  
  // Return default resources if none exist
  const defaultResources: PlayerResources = {
    actionPoints: 10,
    wealthPoints: 20,
    magicPoints: 15,
    influencePoints: 25,
    commandPoints: 12
  };
  
  await updatePlayerResources(userId, defaultResources);
  return defaultResources;
};

// World events and timeline
export const addWorldEvent = async (event: Omit<WorldEvent, 'id'>): Promise<void> => {
  const eventsRef = ref(database, 'worldEvents');
  await push(eventsRef, event);
};

export const getWorldEvents = async (limit: number = 50): Promise<WorldEvent[]> => {
  try {
    const eventsRef = ref(database, 'worldEvents');
    const eventsQuery = query(eventsRef, orderByChild('timestamp'), limitToLast(limit));
    const snapshot = await get(eventsQuery);
    
    console.log('Loading world events - snapshot exists:', snapshot.exists());
    
    if (!snapshot.exists()) {
      console.log('No world events found, returning empty array');
      return [];
    }
    
    const events: WorldEvent[] = [];
    snapshot.forEach((child) => {
      events.push({
        id: child.key!,
        ...child.val()
      });
    });
    
    console.log('Loaded world events:', events.length);
    return events.reverse(); // Most recent first
  } catch (error) {
    console.error('Error loading world events:', error);
    return []; // Return empty array on error instead of throwing
  }
};

// Real-time chat
export const sendChatMessage = async (message: Omit<ChatMessage, 'id'>): Promise<void> => {
  const messagesRef = ref(database, 'chatMessages');
  await push(messagesRef, message);
};

export const subscribeToChat = (callback: (messages: ChatMessage[]) => void): () => void => {
  const messagesRef = ref(database, 'chatMessages');
  const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(100));
  
  const unsubscribe = onValue(messagesQuery, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    
    const messages: ChatMessage[] = [];
    snapshot.forEach((child) => {
      messages.push({
        id: child.key!,
        ...child.val()
      });
    });
    
    callback(messages);
  });
  
  return () => off(messagesRef, 'value', unsubscribe);
};