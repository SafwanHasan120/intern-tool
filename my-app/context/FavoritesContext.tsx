'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { saveFavoritesToFirestore, loadFavoritesFromFirestore } from '@/lib/firestore-sync';

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
  const { user } = useAuth();

  // Load from Firestore (if logged in) or reset to empty (if not)
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        const loaded = await loadFavoritesFromFirestore(user.uid);
        if (loaded) {
          setFavorites(loaded);
        }
      } else {
        setFavorites(new Set());
      }
      setIsLoading(false);
    };

    loadFavorites();
  }, [user?.uid, user]);

  // Persist to Firestore (only if user is logged in)
  useEffect(() => {
    if (!isLoading && user) {
      saveFavoritesToFirestore(user.uid, favorites);
    }
  }, [favorites, isLoading, user]);

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
