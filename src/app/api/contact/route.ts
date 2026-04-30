import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerSlug, name, email, company, phone, serviceNeeded, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Look up the provider
    let providerId: string | null = null;
    if (providerSlug) {
      const { data: provider } = await supabase
        .from('providers')
        .select('id')
        .eq('slug', providerSlug)
        .single();
      providerId = provider?.id || null;
    }

    // Insert contact submission
    const { error: insertError } = await supabase.from('contact_submissions').insert({
      provider_id: providerId,
      name,
      email,
      company: company || null,
      phone: phone || null,
      service_needed: serviceNeeded || null,
      message,
      source_page: providerSlug ? `/providers/${providerSlug}` : '/contact',
    });

    if (insertError) {
      console.error('Failed to insert contact submission:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit contact form' },
        { status: 500 }
      );
    }

    // TODO: Send email notification to provider via Resend when configured
    // If claimed, notify the provider's contact email
    // Also notify admin at jwilson@viso.group

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
