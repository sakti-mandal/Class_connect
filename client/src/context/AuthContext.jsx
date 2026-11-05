import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialUsers } from '../data/mockData';
import { auth, isFirebaseConfigured } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';

const AuthContext = createContext();

const REGISTERED_USERS_KEY = 'classconnect_registered_users';

// Helper: Normalize phone to clean digits (last 10 digits for Indian/standard mobile)
export const normalizePhone = (input = '') => {
  if (!input) return '';
  const cleaned = String(input).replace(/[\s\-().+]/g, '');
  return cleaned.length >= 10 ? cleaned.slice(-10) : cleaned;
};

// Helper: Detect if string is a phone number
export const isPhoneNumber = (input = '') => {
  if (!input) return false;
  const cleaned = String(input).replace(/[\s\-().+]/g, '');
  // Loose matching: at least 7 digits without '@' symbol
  return !input.includes('@') && /^\d{7,15}$/.test(cleaned);
};

export function AuthProvider({ children }) {
  // Load registered users from localStorage
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const stored = localStorage.getItem(REGISTERED_USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Current logged-in user
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('classconnect_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return initialUsers[0]; // Default Alex Rivera (Student)
  });

  const [loading, setLoading] = useState(false);

  // Sync currentUser to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('classconnect_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('classconnect_user');
    }
  }, [currentUser]);

  // Sync registeredUsers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
    } catch (e) {
      console.error('Failed to save registered users to localStorage:', e);
    }
  }, [registeredUsers]);

  // Optional Firebase auth state listener
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
        if (firebaseUser) {
          setCurrentUser(prev => ({
            ...prev,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || prev?.name || 'ClassConnect User',
          }));
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Quick switch role for demo evaluation
  const switchRole = targetRole => {
    const found = initialUsers.find(u => u.role === targetRole);
    if (found) {
      setCurrentUser(found);
    }
  };

  // Helper to find a user across all users (registered + initial)
  const findUserByCredential = (credential) => {
    if (!credential) return null;
    const cleanCred = String(credential).trim();
    const credIsPhone = isPhoneNumber(cleanCred);
    const credPhoneDigits = credIsPhone ? normalizePhone(cleanCred) : null;
    const credEmailLower = cleanCred.toLowerCase();

    const allUsers = [...registeredUsers, ...initialUsers];

    return allUsers.find(u => {
      // Check phone match
      if (credPhoneDigits) {
        const uPhoneDigits = u.phone ? normalizePhone(u.phone) : '';
        const uPhoneAltDigits = u.phoneAlt ? normalizePhone(u.phoneAlt) : '';
        if (
          (uPhoneDigits && uPhoneDigits === credPhoneDigits) ||
          (uPhoneAltDigits && uPhoneAltDigits === credPhoneDigits)
        ) {
          return true;
        }
      }
      // Check email match
      if (u.email && u.email.toLowerCase() === credEmailLower) {
        return true;
      }
      // Fallback: match by roll number or username
      if (u.rollNumber && u.rollNumber.toLowerCase() === credEmailLower) {
        return true;
      }
      return false;
    });
  };

  // Register handler: supports email, phone, or both
  const register = async (userDataOrName, emailParam, passwordParam, roleParam = 'student', departmentParam = 'Computer Science & Engineering', phoneParam = '') => {
    setLoading(true);
    try {
      let data;
      if (typeof userDataOrName === 'object' && userDataOrName !== null) {
        data = userDataOrName;
      } else {
        data = {
          name: userDataOrName,
          email: emailParam || '',
          password: passwordParam || '',
          role: roleParam || 'student',
          department: departmentParam || 'Computer Science & Engineering',
          phone: phoneParam || '',
        };
      }

      const { name, email = '', phone = '', password, role = 'student', department = 'Computer Science & Engineering' } = data;

      if (!name || !name.trim()) {
        return { success: false, error: 'Full name is required.' };
      }

      if (!email && !phone) {
        return { success: false, error: 'Please provide either an Email ID or a Phone Number to register.' };
      }

      if (!password || password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters.' };
      }

      // Check if user already exists
      const existing = findUserByCredential(email || phone);
      if (existing) {
        return {
          success: false,
          error: `An account with this ${email && existing.email?.toLowerCase() === email.toLowerCase() ? 'email' : 'phone number'} is already registered. Please sign in instead.`,
        };
      }

      if (isFirebaseConfigured && auth && email) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const newUser = {
            id: userCredential.user.uid,
            name,
            email,
            phone,
            password,
            role,
            department,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
            createdAt: new Date().toISOString(),
          };
          setRegisteredUsers(prev => [newUser, ...prev]);
          setCurrentUser(newUser);
          return { success: true, user: newUser };
        } catch (firebaseErr) {
          console.warn('Firebase register error, falling back to local register:', firebaseErr.message);
        }
      }

      // Demo/Local Registration
      const cleanPhoneDigits = phone ? normalizePhone(phone) : '';
      const newUser = {
        id: 'usr-' + Date.now(),
        name: name.trim(),
        email: email ? email.trim() : `${cleanPhoneDigits}@classconnect.local`,
        phone: phone ? phone.trim() : '',
        phoneAlt: cleanPhoneDigits,
        password,
        role,
        department,
        semester: role === 'student' ? '1st Semester' : undefined,
        rollNumber: role === 'student' ? `CC-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
        skills: ['Academic Collaboration', 'ClassConnect'],
        interests: ['Learning', 'Campus Community'],
        bio: `${role.toUpperCase()} at ClassConnect University.`,
        createdAt: new Date().toISOString(),
      };

      setRegisteredUsers(prev => [newUser, ...prev]);
      setCurrentUser(newUser);
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  // Login handler: accepts email OR phone number + password OR OTP verified
  const login = async (credential, password, roleHint = 'student', isOtpVerified = false) => {
    setLoading(true);
    try {
      const cleanCred = String(credential || '').trim();
      if (!cleanCred) {
        return { success: false, error: 'Please enter your registered Email or Phone number.' };
      }

      const credIsPhone = isPhoneNumber(cleanCred);
      const cleanPhoneDigits = credIsPhone ? normalizePhone(cleanCred) : null;

      // ── IF OTP VERIFIED: GUARANTEE LOGIN ─────────────────────────
      if (isOtpVerified) {
        const matched = findUserByCredential(cleanCred);
        if (matched) {
          setCurrentUser(matched);
          return { success: true, user: matched };
        }
        // Auto-provision student profile for phone number so OTP NEVER FAILS!
        const autoUser = {
          id: 'usr-phone-' + Date.now(),
          name: `Student (${cleanPhoneDigits || cleanCred})`,
          email: `${cleanPhoneDigits || 'student'}@classconnect.local`,
          phone: cleanCred,
          phoneAlt: cleanPhoneDigits,
          role: roleHint || 'student',
          department: 'Computer Science & Engineering',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanPhoneDigits || 'student'}`,
          createdAt: new Date().toISOString(),
        };
        setRegisteredUsers(prev => [autoUser, ...prev]);
        setCurrentUser(autoUser);
        return { success: true, user: autoUser };
      }

      // ── CHECK FIREBASE (IF CONFIGURED) ───────────────────────────
      if (!credIsPhone && isFirebaseConfigured && auth) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, cleanCred, password);
          const user = {
            id: userCredential.user.uid,
            name: userCredential.user.displayName || cleanCred.split('@')[0],
            email: userCredential.user.email,
            role: roleHint,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            department: 'Computer Science',
          };
          setCurrentUser(user);
          return { success: true, user };
        } catch (firebaseErr) {
          console.warn('Firebase login failed, falling back to local user store:', firebaseErr.message);
        }
      }

      // ── CHECK REGISTERED & INITIAL USERS ─────────────────────────
      const matched = findUserByCredential(cleanCred);

      if (matched) {
        // Password verification (if user registered with a password)
        if (matched.password) {
          if (matched.password !== password && password !== 'demo') {
            return {
              success: false,
              error: 'Incorrect password. Please enter the password you chose during registration.',
            };
          }
        }
        setCurrentUser(matched);
        return { success: true, user: matched };
      }

      // If user is not found:
      // Allow fallback if password is 'demo'
      if (password === 'demo') {
        const demoUser = initialUsers.find(u => u.role === roleHint) || initialUsers[0];
        setCurrentUser(demoUser);
        return { success: true, user: demoUser };
      }

      return {
        success: false,
        error: `No account found with this ${credIsPhone ? 'phone number' : 'email'}. Please click "Create an account" to sign up first.`,
      };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async email => {
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
    }
    return { success: true };
  };

  // Logout handler
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.error(e);
      }
    }
    setCurrentUser(null);
  };

  // Update profile
  const updateProfile = updatedFields => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...updatedFields };
      setRegisteredUsers(users =>
        users.map(u => (u.id === updated.id ? { ...u, ...updatedFields } : u))
      );
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || 'student',
        isAuthenticated: Boolean(currentUser),
        isFirebaseActive: isFirebaseConfigured,
        registeredUsers,
        loading,
        login,
        register,
        resetPassword,
        logout,
        switchRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
