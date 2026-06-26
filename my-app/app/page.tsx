import { scrapeAllRepos } from '@/lib/scraper';
import { rankInternships } from '@/lib/ranker';
import InternshipTable from '@/components/InternshipTable';
import type { Internship } from '@/lib/types';

export const revalidate = 3600;

export default async function Home() {
  const all = await scrapeAllRepos();
  const internships: Internship[] = rankInternships(all);

  return (
    <main>
      <h1>Summer 2027 Internships</h1>
      <InternshipTable internships={internships} />
    </main>
  );
}
