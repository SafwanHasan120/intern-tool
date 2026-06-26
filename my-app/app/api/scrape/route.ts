import { NextResponse } from 'next/server';
import { scrapeAllRepos } from '@/lib/scraper';
import { rankInternships } from '@/lib/ranker';

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location') ?? '';

  const all = await scrapeAllRepos();
  const internships = rankInternships(all, location);

  return NextResponse.json(
    { internships, total: internships.length },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  );
}
