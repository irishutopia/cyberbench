import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

interface LeadDetails {
  buyerName: string;
  buyerEmail: string;
  company: string | null;
  phone: string | null;
  serviceNeeded: string | null;
  message: string;
  sourcePage: string;
  providerName: string | null;
  providerContactEmail: string | null;
  providerIsClaimed: boolean;
}

/** Escape user-supplied text before embedding in notification HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Build the shared lead-detail HTML body. */
function leadDetailsHtml(lead: LeadDetails): string {
  const row = (label: string, val: string | null) =>
    val ? `<p><strong>${label}:</strong> ${escapeHtml(val)}</p>` : '';
  return `
    ${row('Name', lead.buyerName)}
    ${row('Email', lead.buyerEmail)}
    ${row('Company', lead.company)}
    ${row('Phone', lead.phone)}
    ${row('Service needed', lead.serviceNeeded)}
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(lead.message).replace(/\n/g, '<br>')}</p>
    <hr>
    ${row('Provider', lead.providerName)}
    ${row('Source page', lead.sourcePage)}
  `;
}

/** Send a single email via Resend, matching the pattern used elsewhere. */
async function sendResendEmail(resendKey: string, to: string, subject: string, html: string) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: 'CyberBench <notifications@viso.group>',
      to,
      subject,
      html,
    }),
  });
}

/**
 * Notify the provider (if claimed with a usable contact email) and always
 * notify the admin. Failures are logged but never block the API response.
 */
async function sendLeadNotifications(lead: LeadDetails) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log(
      `[CyberBench] New contact lead from ${lead.buyerName} (${lead.buyerEmail}) via ${lead.sourcePage} — no RESEND_API_KEY, skipping email`
    );
    return;
  }

  const html = leadDetailsHtml(lead);

  // Notify the provider only if claimed and we have a usable contact email.
  if (lead.providerIsClaimed && lead.providerContactEmail) {
    try {
      await sendResendEmail(
        resendKey,
        lead.providerContactEmail,
        `New CyberBench lead: ${lead.buyerName}`,
        `<h2>You have a new lead from CyberBench</h2>${html}`
      );
    } catch (err) {
      console.error('Failed to send provider lead notification:', err);
    }
  }

  // Always notify the admin.
  try {
    await sendResendEmail(
      resendKey,
      process.env.ADMIN_EMAILS || 'jwilson@viso.group',
      'New CyberBench contact submission',
      `<h2>New contact submission</h2>${html}`
    );
  } catch (err) {
    console.error('Failed to send admin lead notification:', err);
  }
}

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
    let providerName: string | null = null;
    let providerContactEmail: string | null = null;
    let providerIsClaimed = false;
    if (providerSlug) {
      const { data: provider } = await supabase
        .from('providers')
        .select('id, name, contact_email, is_claimed')
        .eq('slug', providerSlug)
        .single();
      providerId = provider?.id || null;
      providerName = provider?.name || null;
      providerContactEmail = provider?.contact_email || null;
      providerIsClaimed = provider?.is_claimed || false;
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

    // Send email notifications via Resend (non-blocking — never fail the
    // response if email delivery has a problem).
    const sourcePage = providerSlug ? `/providers/${providerSlug}` : '/contact';
    await sendLeadNotifications({
      buyerName: name,
      buyerEmail: email,
      company: company || null,
      phone: phone || null,
      serviceNeeded: serviceNeeded || null,
      message,
      sourcePage,
      providerName,
      providerContactEmail,
      providerIsClaimed,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
