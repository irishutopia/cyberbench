import { NextRequest, NextResponse } from 'next/server';
import { getProviders } from '@/lib/data';

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const filters = {
    q: sp.get('q') || undefined,
    category: sp.get('category') || undefined,
    state: sp.get('state') || undefined,
    city: sp.get('city') || undefined,
    page: parseInt(sp.get('page') || '1', 10),
  };

  const { providers, total } = await getProviders(filters);
  return NextResponse.json({
    providers: providers.map((p) => ({
      slug: p.slug,
      name: p.name,
      description: p.description,
      headquarters: p.headquarters,
      employee_count: p.employee_count,
      website: p.website,
      services: p.services?.map((s) => ({ slug: s.slug, name: s.name })),
    })),
    total,
    page: filters.page,
  });
}
