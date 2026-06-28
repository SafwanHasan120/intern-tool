'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
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

  const updateLatex = useCallback((latex: string) => {
    setSettings((s) => ({ ...s, latex }));
  }, []);

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
