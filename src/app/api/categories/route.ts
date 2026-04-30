import { NextResponse } from 'next/server';
import { getCategories, getProvidersByCategory } from '@/lib/data';

export async function GET() {
  const categories = await getCategories();

  const result = await Promise.all(
    categories.map(async (cat) => {
      const providers = await getProvidersByCategory(cat.slug);
      return {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        provider_count: providers.length,
      };
    })
  );

  return NextResponse.json({ categories: result });
}
