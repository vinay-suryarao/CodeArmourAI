import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, firebaseConfigError } from '../config/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string, displayName: string) {
    if (firebaseConfigError) {
      throw new Error(firebaseConfigError);
    }

    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Auth success should not fail due to optional profile/firestore sync issues.
    try {
      await updateProfile(result.user, { displayName });
    } catch (error) {
      console.warn('Profile update failed after signup:', error);
    }

    try {
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
    } catch (error) {
      console.warn('Firestore user document creation failed after signup:', error);
    }
  }

  async function login(email: string, password: string) {
    if (firebaseConfigError) {
      throw new Error(firebaseConfigError);
    }

    const result = await signInWithEmailAndPassword(auth, email, password);

    // Login should remain successful even if Firestore profile sync fails.
    try {
      const userDoc = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userDoc);
      if (userSnap.exists()) {
        await setDoc(userDoc, { lastLogin: serverTimestamp() }, { merge: true });
      }
    } catch (error) {
      console.warn('Firestore lastLogin update failed after login:', error);
    }
  }

  async function logout() {
    await signOut(auth);
  }

  async function resetPassword(email: string) {
    if (firebaseConfigError) {
      throw new Error(firebaseConfigError);
    }

    await sendPasswordResetEmail(auth, email);
  }

  async function getIdToken(): Promise<string | null> {
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    return null;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    getIdToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
