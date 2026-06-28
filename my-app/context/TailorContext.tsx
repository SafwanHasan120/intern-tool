'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface TailorResult {
  internshipId: string;
  latex: string;
  tailoredAt: number;
}

interface TailorContextValue {
  getResult: (internshipId: string) => TailorResult | null;
  setResult: (result: TailorResult) => void;
  clearResult: (internshipId: string) => void;
}

const TailorContext = createContext<TailorContextValue | null>(null);

export function TailorProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<Map<string, TailorResult>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('tailor-results');
    if (stored) {
      try {
        const data = JSON.parse(stored) as Array<[string, TailorResult]>;
        setResults(new Map(data));
      } catch {
        // ignore parse errors
      }
    }
    setIsLoading(false);
  }, []);

  // Persist to localStorage whenever results change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('tailor-results', JSON.stringify(Array.from(results.entries())));
    }
  }, [results, isLoading]);

  const getResult = useCallback(
    (internshipId: string) => results.get(internshipId) || null,
    [results]
  );

  const setResult = useCallback((result: TailorResult) => {
    setResults((prev) => new Map(prev).set(result.internshipId, result));
  }, []);

  const clearResult = useCallback((internshipId: string) => {
    setResults((prev) => {
      const next = new Map(prev);
      next.delete(internshipId);
      return next;
    });
  }, []);

  return (
    <TailorContext.Provider value={{ getResult, setResult, clearResult }}>
      {children}
    </TailorContext.Provider>
  );
}

export function useTailor(): TailorContextValue {
  const ctx = useContext(TailorContext);
  if (!ctx) throw new Error('useTailor must be used within a TailorProvider');
  return ctx;
}
