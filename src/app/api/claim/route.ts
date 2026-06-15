import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/** Escape user-supplied text before embedding in notification HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface ClaimNotice {
  providerName: string | null;
  providerSlug: string;
  fullName: string;
  jobTitle: string;
  workEmail: string;
  phone: string | null;
  verificationMethod: string;
  notes: string | null;
}

/**
 * Notify the admin that a provider claim was submitted. Failures are logged
 * but never block the API response.
 */
async function sendClaimNotification(claim: ClaimNotice) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log(
      `[CyberBench] Claim submitted for ${claim.providerSlug} by ${claim.fullName} (${claim.workEmail}) — no RESEND_API_KEY, skipping email`
    );
    return;
  }

  const row = (label: string, val: string | null) =>
    val ? `<p><strong>${label}:</strong> ${escapeHtml(val)}</p>` : '';
  const html = `
    <h2>New provider claim request</h2>
    ${row('Listing', claim.providerName || claim.providerSlug)}
    ${row('Slug', claim.providerSlug)}
    ${row('Name', claim.fullName)}
    ${row('Title', claim.jobTitle)}
    ${row('Work email', claim.workEmail)}
    ${row('Phone', claim.phone)}
    ${row('Verification method', claim.verificationMethod)}
    ${claim.notes ? `<p><strong>Notes:</strong></p><p>${escapeHtml(claim.notes).replace(/\n/g, '<br>')}</p>` : ''}
  `;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'CyberBench <notifications@viso.group>',
        to: process.env.ADMIN_EMAILS || 'jwilson@viso.group',
        subject: `New CyberBench claim: ${claim.providerName || claim.providerSlug}`,
        html,
      }),
    });
  } catch (err) {
    console.error('Failed to send claim notification:', err);
  }
}

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

    // Notify admin of the claim (non-blocking — never fail the response on email error).
    await sendClaimNotification({
      providerName: provider?.name ?? null,
      providerSlug,
      fullName,
      jobTitle,
      workEmail,
      phone: phone || null,
      verificationMethod,
      notes: notes || null,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
