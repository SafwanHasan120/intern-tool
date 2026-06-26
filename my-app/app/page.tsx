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
      {/* Hero */}
      <section className="spa-fade-up py-16 text-center sm:py-20 lg:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-accent-soft px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Curated · Updated hourly
        </span>

        <h1 className="mx-auto mt-7 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          The Summer 2027 internships,
          <span className="block text-accent">refined for you.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-gray-500 sm:text-lg">
          A calm, considered view of {internships.length.toLocaleString()} open
          positions — ranked by recency, prestige, and fit. Search, filter, and
          apply without the noise.
        </p>
      </section>

      <InternshipTable internships={internships} />
    </main>
  );
}
