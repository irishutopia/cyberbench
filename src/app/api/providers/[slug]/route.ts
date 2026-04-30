import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createServerClient();
    const admin = createAdminClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get provider and verify ownership
    const { data: provider } = await admin
      .from('providers')
      .select('id, claimed_by')
      .eq('slug', slug)
      .single();

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    if (provider.claimed_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name, description, long_description, website,
      contact_email, contact_phone, city, state, state_code,
      employee_count, founded_year, service_ids, certification_ids,
    } = body;

    // Update provider
    const { error: updateError } = await admin
      .from('providers')
      .update({
        name, description, long_description, website,
        contact_email, contact_phone, city, state, state_code,
        employee_count, founded_year,
        updated_at: new Date().toISOString(),
      })
      .eq('id', provider.id);

    if (updateError) {
      console.error('Provider update error:', updateError);
      return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 });
    }

    // Update services
    if (Array.isArray(service_ids)) {
      await admin.from('provider_services').delete().eq('provider_id', provider.id);
      if (service_ids.length > 0) {
        await admin.from('provider_services').insert(
          service_ids.map((cat_id: string, i: number) => ({
            provider_id: provider.id,
            category_id: cat_id,
            is_primary: i === 0,
          }))
        );
      }
    }

    // Update certifications
    if (Array.isArray(certification_ids)) {
      await admin.from('provider_certifications').delete().eq('provider_id', provider.id);
      if (certification_ids.length > 0) {
        await admin.from('provider_certifications').insert(
          certification_ids.map((cert_id: string) => ({
            provider_id: provider.id,
            certification_id: cert_id,
          }))
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Provider PUT error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
