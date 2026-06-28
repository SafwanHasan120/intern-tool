'use client';

import { useState, useMemo } from 'react';
import InternshipTable from '@/components/InternshipTable';
import { useFavorites } from '@/context/FavoritesContext';
import type { Internship } from '@/lib/types';

interface HomeContentProps {
  internships: Internship[];
}

type ViewTab = 'all' | 'favorites';

export default function HomeContent({ internships }: HomeContentProps) {
  const [view, setView] = useState<ViewTab>('all');
  const { favorites, isLoading } = useFavorites();

  const displayedInternships = useMemo(() => {
    if (view === 'favorites') {
      return internships.filter((i) => favorites.has(i.id));
    }
    return internships;
  }, [view, internships, favorites]);

  const tabBaseClass =
    'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200';
  const tabActiveClass =
    'bg-gray-900 text-white shadow-sm';
  const tabInactiveClass =
    'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900';

  return (
    <main className="mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8 lg:px-12">
      
      {/* View tabs */}
      <div className="mb-8 mt-12 flex items-center gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView('all')}
            className={`${tabBaseClass} ${view === 'all' ? tabActiveClass : tabInactiveClass}`}
          >
            All Jobs
            <span className="text-xs opacity-70">{internships.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setView('favorites')}
            className={`${tabBaseClass} ${view === 'favorites' ? tabActiveClass : tabInactiveClass}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            Favorites
            {!isLoading && <span className="text-xs opacity-70">{favorites.size}</span>}
          </button>
        </div>
      </div>

      <InternshipTable internships={displayedInternships} showFavorites onlyFavorites={view === 'favorites'} />
    </main>
  );
}
