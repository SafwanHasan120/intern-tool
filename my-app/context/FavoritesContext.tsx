'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface FavoritesContextValue {
  favorites: Set<string>;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  count: number;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('internship-favorites');
    if (stored) {
      try {
        const ids = JSON.parse(stored) as string[];
        setFavorites(new Set(ids));
      } catch {
        // ignore parse errors
      }
    }
    setIsLoading(false);
  }, []);

  // Persist to localStorage whenever favorites changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('internship-favorites', JSON.stringify(Array.from(favorites)));
    }
  }, [favorites, isLoading]);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, toggleFavorite, count: favorites.size, isLoading }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider');
  return ctx;
}
