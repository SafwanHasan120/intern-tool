'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { saveResumeToFirestore, loadResumeFromFirestore } from '@/lib/firestore-sync';
import type { ResumeSettings } from '@/lib/types';

interface ResumeContextValue {
  settings: ResumeSettings;
  isOpen: boolean;
  updateLatex: (latex: string) => void;
  open: () => void;
  close: () => void;
}

const DEFAULT_SETTINGS: ResumeSettings = {
  latex: '',
};

const ResumeContext = createContext<ResumeContextValue | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ResumeSettings>(DEFAULT_SETTINGS);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load resume from Firestore on user login
  useEffect(() => {
    if (!user) {
      setSettings(DEFAULT_SETTINGS);
      setIsLoading(false);
      return;
    }

    const loadResume = async () => {
      const saved = await loadResumeFromFirestore(user.uid);
      if (saved) {
        setSettings(saved);
      }
      setIsLoading(false);
    };

    loadResume();
  }, [user?.uid, user]);

  const updateLatex = useCallback(
    (latex: string) => {
      setSettings((s) => ({ ...s, latex }));

      // Save to Firestore if user is logged in
      if (user) {
        saveResumeToFirestore(user.uid, { latex }).catch((error) => {
          console.error('Failed to save resume:', error);
        });
      }
    },
    [user]
  );

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <ResumeContext.Provider
      value={{ settings, isOpen, updateLatex, open, close }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume(): ResumeContextValue {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error('useResume must be used within a ResumeProvider');
  return ctx;
}
