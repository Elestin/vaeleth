import { useEffect } from 'react';
import { useAppStore } from '@/store';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  onAuthStateChange
} from '@/services/auth';
import { getDeity, getRace, getPlayerResources } from '@/services/database';

export const useAuthHook = () => {
  const { 
    currentUser: user,
    setCurrentUser: setUser, 
    setDeity, 
    setRace, 
    setResources,
    setLoading, 
    setError,
    getNextAvailableTab,
    setCurrentTab
  } = useAppStore();

  useEffect(() => {
    let mounted = true;
    
    try {
      const unsubscribe = onAuthStateChange(async (user) => {
        if (!mounted) return;
        
        setUser(user);
        
        if (user) {
          try {
            // Load user's game data
            const [deity, race, resources] = await Promise.all([
              getDeity(user.uid),
              getRace(user.uid),
              getPlayerResources(user.uid)
            ]);
            
            if (!mounted) return;
            
            setDeity(deity);
            setRace(race);
            setResources(resources || {
              actionPoints: 10,
              wealthPoints: 20,
              magicPoints: 15,
              influencePoints: 25,
              commandPoints: 12
            });
            
            console.log('User data loaded:', { deity, race, resources });
            
            // Navigate to appropriate tab
            const nextTab = getNextAvailableTab();
            setCurrentTab(nextTab);
            
          } catch (error) {
            console.error('Failed to load user data:', error);
            if (mounted) {
              setError('Failed to load your game data');
            }
          }
        } else {
          // Clear user data when logged out
          if (mounted) {
            setDeity(null);
            setRace(null);
            setResources({
              actionPoints: 10,
              wealthPoints: 20,
              magicPoints: 15,
              influencePoints: 25,
              commandPoints: 12
            });
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      });

      return () => {
        mounted = false;
        unsubscribe?.();
      };
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      if (mounted) {
        setError('Failed to connect to authentication service');
        setLoading(false);
      }
      return () => {};
    }
  }, [setUser, setDeity, setRace, setResources, setLoading, setError, getNextAvailableTab, setCurrentTab]);

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await registerUser(email, password);
      // User will be automatically set via onAuthStateChange
    } catch (error) {
      setError((error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await loginUser(email, password);
      // User will be automatically set via onAuthStateChange
    } catch (error) {
      setError((error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      // User will be automatically cleared via onAuthStateChange
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    register,
    login,
    logout,
    isAuthenticated: user !== null
  };
};