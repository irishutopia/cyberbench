import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerSlug, fullName, jobTitle, workEmail, phone, verificationMethod, notes } = body;

    // Validate required fields
    if (!providerSlug || !fullName || !jobTitle || !workEmail || !verificationMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Look up the provider
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id, name, is_claimed')
      .eq('slug', providerSlug)
      .single();

    if (providerError || !provider) {
      // Still accept the claim — we'll match it manually
      console.log(`Claim for unlisted provider: ${providerSlug}`);
    }

    if (provider?.is_claimed) {
      return NextResponse.json(
        { error: 'This listing has already been claimed' },
        { status: 409 }
      );
    }

    // Insert claim request
    const { error: insertError } = await supabase.from('claim_requests').insert({
      provider_id: provider?.id || null,
      full_name: fullName,
      job_title: jobTitle,
      work_email: workEmail,
      phone: phone || null,
      verification_method: verificationMethod,
      notes: notes || null,
      status: 'pending',
    });

    if (insertError) {
      console.error('Failed to insert claim:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit claim request' },
        { status: 500 }
      );
    }

    // TODO: Send email notification via Resend when API key is configured
    // await sendClaimNotification({ providerName: provider?.name, fullName, workEmail });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
