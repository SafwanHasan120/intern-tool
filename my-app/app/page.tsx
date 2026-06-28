import { scrapeAllRepos } from '@/lib/scraper';
import { rankInternships } from '@/lib/ranker';
import HomeContent from '@/components/HomeContent';
import type { Internship } from '@/lib/types';

export const revalidate = 3600;

export default async function Home() {
  const all = await scrapeAllRepos();
  const internships: Internship[] = rankInternships(all);

  return <HomeContent internships={internships} />;
}
