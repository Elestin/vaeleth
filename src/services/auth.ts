import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from './firebase';
import { User } from '@/types';

export const registerUser = async (email: string, password: string): Promise<User> => {
  try {
    console.log('Attempting registration with:', { email, passwordLength: password.length });
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid, email: userEmail, displayName } = userCredential.user;
    
    return {
      uid,
      email: userEmail,
      displayName
    };
  } catch (error: any) {
    console.error('Registration error details:', {
      code: error.code,
      message: error.message,
      details: error
    });
    
    // Provide user-friendly error messages
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new Error('An account with this email already exists. Please try logging in.');
      case 'auth/invalid-email':
        throw new Error('Please enter a valid email address.');
      case 'auth/operation-not-allowed':
        throw new Error('Email/password registration is not enabled. Please contact support.');
      case 'auth/weak-password':
        throw new Error('Password is too weak. Please choose a stronger password.');
      default:
        throw new Error(`Registration failed: ${error.message}`);
    }
  }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    console.log('Attempting login with:', { email, passwordLength: password.length });
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { uid, email: userEmail, displayName } = userCredential.user;
    
    return {
      uid,
      email: userEmail,
      displayName
    };
  } catch (error: any) {
    console.error('Login error details:', {
      code: error.code,
      message: error.message,
      details: error
    });
    
    // Provide user-friendly error messages
    switch (error.code) {
      case 'auth/user-not-found':
        throw new Error('No account found with this email address.');
      case 'auth/wrong-password':
        throw new Error('Incorrect password. Please try again.');
      case 'auth/invalid-email':
        throw new Error('Please enter a valid email address.');
      case 'auth/user-disabled':
        throw new Error('This account has been disabled. Please contact support.');
      default:
        throw new Error(`Login failed: ${error.message}`);
    }
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(`Logout failed: ${(error as Error).message}`);
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName
      });
    } else {
      callback(null);
    }
  });
};

export const getCurrentUser = (): User | null => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;
  
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName
  };
};