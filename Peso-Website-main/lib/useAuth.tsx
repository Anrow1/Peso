'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Employer, Admin } from './types';

export type UserRole = 'public' | 'employer' | 'admin';

interface AuthState {
  firebaseUser: User | null;
  employerProfile: Employer | null;
  role: UserRole;
  loading: boolean;
  toast: string | null;
}

interface AuthContextValue extends AuthState {
  loginEmployer: (email: string, password: string) => Promise<{ error?: string; pendingApproval?: boolean }>;
  loginAdmin: (email: string, password: string) => Promise<{ error?: string }>;
  registerAdmin: (email: string, password: string) => Promise<{ error?: string }>;
  registerEmployer: (data: EmployerRegisterData) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  showToast: (msg: string) => void;
}

export interface EmployerRegisterData {
  name: string;
  industry: string;
  address: string;
  contact: string;
  phone: string;
  permit: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Hardcoded admin UIDs — after creating admin in Firebase Console, add UID here.
// Or check Firestore `admins/{uid}` collection for flexible approach.

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    employerProfile: null,
    role: 'public',
    loading: true,
    toast: null,
  });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setState(s => ({ ...s, toast: msg }));
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setState(s => ({ ...s, toast: null })), 3000);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ firebaseUser: null, employerProfile: null, role: 'public', loading: false, toast: null });
        return;
      }

      // Check if admin
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if (adminDoc.exists()) {
        setState(s => ({ ...s, firebaseUser: user, employerProfile: null, role: 'admin', loading: false }));
        return;
      }

      // Check if employer
      const empDoc = await getDoc(doc(db, 'employers', user.uid));
      if (empDoc.exists()) {
        const emp = { id: user.uid, ...empDoc.data() } as Employer;
        setState(s => ({ ...s, firebaseUser: user, employerProfile: emp, role: 'employer', loading: false }));
        return;
      }

      // Authenticated but no profile yet (edge case)
      setState(s => ({ ...s, firebaseUser: user, employerProfile: null, role: 'public', loading: false }));
    });
    return unsub;
  }, []);

  async function loginEmployer(email: string, password: string) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const empDoc = await getDoc(doc(db, 'employers', cred.user.uid));
      if (!empDoc.exists()) {
        await signOut(auth);
        return { error: 'No employer profile found for this account.' };
      }
      const emp = empDoc.data() as Omit<Employer, 'id'>;
      if (emp.status === 'pending') {
        await signOut(auth);
        return { pendingApproval: true };
      }
      if (emp.status === 'rejected') {
        await signOut(auth);
        return { error: 'Your registration was declined by PESO Admin. Please contact the office for assistance.' };
      }
      if (emp.status === 'suspended') {
        await signOut(auth);
        return { error: 'Your account has been suspended. Please contact PESO for assistance.' };
      }
      return {};
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        return { error: 'Incorrect email or password.' };
      }
      return { error: 'Login failed. Please try again.' };
    }
  }

  async function loginAdmin(email: string, password: string) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Verify admin doc exists
      const adminDoc = await getDoc(doc(db, 'admins', cred.user.uid));
      const adminData = adminDoc.data() as Admin;
      if (adminData.status === 'pending') {
        await signOut(auth);
        return { error: 'Your admin registration is pending approval by an existing administrator.' };
      }
      if (adminData.status === 'rejected') {
        await signOut(auth);
        return { error: 'Your admin registration was declined.' };
      }
      return {};
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        return { error: 'Incorrect email or password.' };
      }
      return { error: 'Login failed. Please try again.' };
    }
  }

  async function registerEmployer(data: EmployerRegisterData) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await setDoc(doc(db, 'employers', cred.user.uid), {
        name: data.name,
        industry: data.industry,
        address: data.address,
        contact: data.contact,
        phone: data.phone,
        permit: data.permit,
        email: data.email,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      // Sign out so they can't access employer portal until approved
      await signOut(auth);
      return {};
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code === 'auth/email-already-in-use') {
        return { error: 'This email is already registered. Try logging in instead.' };
      }
      if (err.code === 'auth/weak-password') {
        return { error: 'Password must be at least 6 characters.' };
      }
      return { error: 'Registration failed. Please try again.' };
    }
  }

  async function registerAdmin(email: string, password: string) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'admins', cred.user.uid), {
        email,
        displayName: 'PESO Administrator',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      await signOut(auth);
      return {};
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code === 'auth/email-already-in-use') {
        return { error: 'Email is already registered.' };
      }
      return { error: 'Registration failed. Please try again.' };
    }
  }

  async function logout() {
    await signOut(auth);
    showToast('Logged out successfully.');
  }

  return (
    <AuthContext.Provider value={{ ...state, loginEmployer, loginAdmin, registerAdmin, registerEmployer, logout, showToast }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
