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

  // Load from Firestore (if logged in) or localStorage (if not)
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        // User is logged in - load from Firestore
        const stored = await loadFavoritesFromFirestore(user.uid);
        if (stored) {
          setFavorites(stored);
        } else {
          // No Firestore data yet - try to migrate from localStorage
          const localStored = localStorage.getItem('internship-favorites');
          if (localStored) {
            try {
              const ids = JSON.parse(localStored) as string[];
              setFavorites(new Set(ids));
            } catch {
              // ignore parse errors
            }
          }
        }
      } else {
        // User is not logged in - load from localStorage
        const localStored = localStorage.getItem('internship-favorites');
        if (localStored) {
          try {
            const ids = JSON.parse(localStored) as string[];
            setFavorites(new Set(ids));
          } catch {
            // ignore parse errors
          }
        }
      }
      setIsLoading(false);
    };

    loadFavorites();
  }, [user?.uid, user]);

  // Persist to Firestore (if logged in) and localStorage (always)
  useEffect(() => {
    if (!isLoading) {
      // Always save to localStorage as backup
      localStorage.setItem('internship-favorites', JSON.stringify(Array.from(favorites)));

      // Also save to Firestore if user is logged in
      if (user) {
        saveFavoritesToFirestore(user.uid, favorites).catch((error) => {
          console.error('Failed to save favorites to Firestore:', error);
        });
      }
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
