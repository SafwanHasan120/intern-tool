import { scrapeAllRepos } from '@/lib/scraper';
import { rankInternships } from '@/lib/ranker';
import InternshipTable from '@/components/InternshipTable';
import type { Internship } from '@/lib/types';

export const revalidate = 3600;

export default async function Home() {
  const all = await scrapeAllRepos();
  const internships: Internship[] = rankInternships(all);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8 lg:px-12">
      {/* Intro — one line, left-aligned, straight to the point */}
      <div className="spa-fade-up pt-12 pb-8 sm:pt-16">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          {internships.length.toLocaleString()} Summer 2027 internships
          <span className="text-accent">, ranked.</span>
        </h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          Sorted by recency, prestige, and fit. Search and filter below.
        </p>
      </div>

      <InternshipTable internships={internships} />
    </main>
  );
}
