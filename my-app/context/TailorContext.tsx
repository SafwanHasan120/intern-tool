'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  saveTailorResultToFirestore,
  loadTailorResultsFromFirestore,
  deleteTailorResultFromFirestore,
  type TailorResult,
} from '@/lib/firestore-sync';

export { type TailorResult } from '@/lib/firestore-sync';

interface TailorContextValue {
  getResult: (internshipId: string) => TailorResult | null;
  setResult: (result: TailorResult) => void;
  clearResult: (internshipId: string) => void;
  isLoading: boolean;
  viewTarget: string | null;
  openView: (internshipId: string) => void;
  closeView: () => void;
}

const TailorContext = createContext<TailorContextValue | null>(null);

export function TailorProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<Map<string, TailorResult>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [viewTarget, setViewTarget] = useState<string | null>(null);
  const { user } = useAuth();

  // Load from Firestore when user logs in
  useEffect(() => {
    const loadResults = async () => {
      if (user) {
        const loaded = await loadTailorResultsFromFirestore(user.uid);
        setResults(loaded);
      } else {
        setResults(new Map());
      }
      setIsLoading(false);
    };

    loadResults();
  }, [user?.uid, user]);

  // Note: Firestore persistence happens in setResult and clearResult callbacks below,
  // not in this effect. This ensures we only save when explicitly changing data.

  const getResult = useCallback(
    (internshipId: string) => results.get(internshipId) || null,
    [results]
  );

  const setResult = useCallback((result: TailorResult) => {
    console.log('[TailorContext] setResult called with:', { internshipId: result.internshipId, latexLength: result.latex.length });
    setResults((prev) => {
      const next = new Map(prev).set(result.internshipId, result);
      console.log('[TailorContext] Results updated. Total results:', next.size);
      return next;
    });
    // Save to Firestore if user is logged in
    if (user) {
      console.log('[TailorContext] Saving to Firestore for uid:', user.uid);
      saveTailorResultToFirestore(user.uid, result);
    }
  }, [user]);

  const clearResult = useCallback((internshipId: string) => {
    setResults((prev) => {
      const next = new Map(prev);
      next.delete(internshipId);
      return next;
    });
    // Delete from Firestore if user is logged in
    if (user) {
      deleteTailorResultFromFirestore(user.uid, internshipId);
    }
  }, [user]);

  const openView = useCallback((internshipId: string) => {
    setViewTarget(internshipId);
  }, []);

  const closeView = useCallback(() => {
    setViewTarget(null);
  }, []);

  return (
    <TailorContext.Provider value={{ getResult, setResult, clearResult, isLoading, viewTarget, openView, closeView }}>
      {children}
    </TailorContext.Provider>
  );
}

export function useTailor(): TailorContextValue {
  const ctx = useContext(TailorContext);
  if (!ctx) throw new Error('useTailor must be used within a TailorProvider');
  return ctx;
}
