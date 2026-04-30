import { NextRequest, NextResponse } from 'next/server';
import { searchProviders } from '@/lib/data';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || '';

  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchProviders(q);
  return NextResponse.json({
    query: q,
    count: results.length,
    results: results.map((p) => ({
      slug: p.slug,
      name: p.name,
      description: p.description,
      headquarters: p.headquarters,
      services: p.services?.map((s) => s.name),
    })),
  });
}
