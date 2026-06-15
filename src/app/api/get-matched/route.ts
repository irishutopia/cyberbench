import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY || '';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  if (!TURNSTILE_SECRET) {
    console.warn('[CyberBench] No TURNSTILE_SECRET_KEY set, skipping verification');
    return true;
  }
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: TURNSTILE_SECRET,
        response: token,
        remoteip: ip || undefined,
      }),
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return false;
  }
}

interface MatchedProvider {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  contact_email: string | null;
  is_founding: boolean;
  is_verified: boolean;
  is_featured: boolean;
  state_code: string | null;
}

async function sendResendEmail(
  resendKey: string,
  to: string,
  subject: string,
  html: string,
) {
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

async function sendMatchEmails(
  resendKey: string,
  buyer: {
    name: string;
    email: string;
    company: string | null;
    stateCode: string;
    budget: string | null;
    need: string;
    categoryName: string;
  },
  matched: MatchedProvider[],
) {
  const safeNeed = escapeHtml(buyer.need).replace(/\n/g, '<br>');
  const safeName = escapeHtml(buyer.name);
  const safeEmail = escapeHtml(buyer.email);
  const safeCompany = buyer.company ? escapeHtml(buyer.company) : null;
  const safeBudget = buyer.budget ? escapeHtml(buyer.budget) : null;
  const safeCategory = escapeHtml(buyer.categoryName);
  const safeState = escapeHtml(buyer.stateCode);

  // Notify each matched provider
  for (const provider of matched) {
    if (!provider.contact_email) continue;
    try {
      await sendResendEmail(
        resendKey,
        provider.contact_email,
        `New matched lead from CyberBench — ${safeCategory}`,
        `
          <h2>You have a new matched lead from CyberBench</h2>
          <p>A buyer looking for <strong>${safeCategory}</strong> services has been matched with your company.</p>
          <hr>
          <p><strong>Buyer Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          ${safeCompany ? `<p><strong>Company:</strong> ${safeCompany}</p>` : ''}
          <p><strong>State:</strong> ${safeState}</p>
          ${safeBudget ? `<p><strong>Budget:</strong> ${safeBudget}</p>` : ''}
          <p><strong>What they need:</strong></p>
          <p>${safeNeed}</p>
          <hr>
          <p style="color:#888;font-size:12px;">You received this because you are listed on CyberBench as a provider in the ${safeCategory} category. Reply directly to ${safeEmail} to connect.</p>
        `,
      );
    } catch (err) {
      console.error(`Failed to notify provider ${provider.slug}:`, err);
    }
  }

  // Confirmation to buyer
  const providerListHtml = matched
    .map(
      (p) =>
        `<li><strong>${escapeHtml(p.name)}</strong>${p.description ? ` — ${escapeHtml(p.description).substring(0, 120)}...` : ''}<br><a href="https://cyberbench.net/providers/${escapeHtml(p.slug)}">View profile →</a></li>`,
    )
    .join('');

  try {
    await sendResendEmail(
      resendKey,
      buyer.email,
      `Your CyberBench match results — ${buyer.categoryName}`,
      `
        <h2>Here are your matched cybersecurity providers</h2>
        <p>Hi ${safeName},</p>
        <p>Thanks for using CyberBench. Based on your request for <strong>${safeCategory}</strong> services, we&apos;ve notified the following provider${matched.length !== 1 ? 's' : ''} about your inquiry:</p>
        <ul style="line-height:2">${providerListHtml || '<li>No matching providers found at this time. Our team will follow up shortly.</li>'}</ul>
        <p>Each provider has been sent your contact information and will reach out directly.</p>
        <p>You can also browse the full directory at <a href="https://cyberbench.net/providers">cyberbench.net/providers</a>.</p>
        <p style="color:#888;font-size:12px;">CyberBench — The Trusted Cybersecurity Directory</p>
      `,
    );
  } catch (err) {
    console.error('Failed to send buyer confirmation:', err);
  }

  // Admin notification
  const adminEmail = process.env.ADMIN_EMAILS || 'jwilson@viso.group';
  try {
    await sendResendEmail(
      resendKey,
      adminEmail,
      `New Get Matched request — ${buyer.categoryName}`,
      `
        <h2>New Get Matched Request</h2>
        <p><strong>Buyer:</strong> ${safeName} (${safeEmail})</p>
        ${safeCompany ? `<p><strong>Company:</strong> ${safeCompany}</p>` : ''}
        <p><strong>Service:</strong> ${safeCategory}</p>
        <p><strong>State:</strong> ${safeState}</p>
        ${safeBudget ? `<p><strong>Budget:</strong> ${safeBudget}</p>` : ''}
        <p><strong>Need:</strong></p>
        <p>${safeNeed}</p>
        <hr>
        <p><strong>Matched providers (${matched.length}):</strong></p>
        <ul>${matched.map((p) => `<li>${escapeHtml(p.name)} (${p.slug})</li>`).join('')}</ul>
        <p><a href="https://cyberbench.net/admin">Review in Admin Panel →</a></p>
      `,
    );
  } catch (err) {
    console.error('Failed to send admin notification:', err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      company,
      categorySlug,
      stateCode,
      budget,
      need,
      _hp,
      turnstileToken,
    } = body;

    // Honeypot — silent accept to avoid tipping off bots
    if (_hp) {
      return NextResponse.json({ success: true });
    }

    // Turnstile
    if (!turnstileToken) {
      return NextResponse.json(
        { error: 'Security verification required. Please try again.' },
        { status: 400 },
      );
    }

    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    const turnstileValid = await verifyTurnstile(turnstileToken, clientIp);
    if (!turnstileValid) {
      return NextResponse.json(
        { error: 'Security verification failed. Please refresh and try again.' },
        { status: 403 },
      );
    }

    // Required field validation
    if (!name?.trim() || !email?.trim() || !categorySlug?.trim() || !stateCode?.trim() || !need?.trim()) {
      return NextResponse.json(
        { error: 'Name, email, service category, state, and description are required.' },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    if (need.trim().length < 10 || need.trim().length > 2000) {
      return NextResponse.json(
        { error: 'Description must be between 10 and 2000 characters.' },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Look up category
    const { data: category } = await supabase
      .from('service_categories')
      .select('id, name, slug')
      .eq('slug', categorySlug)
      .maybeSingle();

    if (!category) {
      return NextResponse.json(
        { error: 'Invalid service category.' },
        { status: 400 },
      );
    }

    // Match providers: find active providers offering this service category.
    // Rank: founding > verified > featured > basic. Boost same-state providers.
    // Take top 3.

    // Step 1: get provider IDs for this category
    const { data: serviceRows } = await supabase
      .from('provider_services')
      .select('provider_id')
      .eq('category_id', category.id);

    const categoryProviderIds = (serviceRows || []).map(
      (r: { provider_id: string }) => r.provider_id,
    );

    let providerRows: MatchedProvider[] = [];
    if (categoryProviderIds.length > 0) {
      const { data } = await supabase
        .from('providers')
        .select(
          'id, name, slug, description, contact_email, is_founding, is_verified, is_featured, state_code',
        )
        // Consent guard: only route buyer leads to providers who have CLAIMED
        // their listing (opted in). Seeded/scraped directory entries are for
        // browse/SEO only and must never be cold-emailed a buyer lead.
        .in('status', ['active', 'claimed'])
        .eq('is_claimed', true)
        .in('id', categoryProviderIds);
      providerRows = data || [];
    }

    const providers: MatchedProvider[] = providerRows.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      contact_email: p.contact_email,
      is_founding: !!p.is_founding,
      is_verified: !!p.is_verified,
      is_featured: !!p.is_featured,
      state_code: p.state_code,
    }));

    // Rank: tier score + location boost
    const ranked = [...providers].sort((a, b) => {
      const scoreA =
        (a.is_founding ? 100 : 0) +
        (a.is_verified ? 10 : 0) +
        (a.is_featured ? 5 : 0) +
        (a.state_code === stateCode ? 3 : 0);
      const scoreB =
        (b.is_founding ? 100 : 0) +
        (b.is_verified ? 10 : 0) +
        (b.is_featured ? 5 : 0) +
        (b.state_code === stateCode ? 3 : 0);
      return scoreB - scoreA;
    });

    const matched = ranked.slice(0, 3);

    // TODO: BILLING HOOK — before persisting, check if matched providers have
    // an active Get Matched subscription and charge the per-lead fee ($50–$150)
    // via Stripe. See after-25 plan (cyberbench-after-25-plan.md).
    // When billing goes live: (1) filter matched to only billing-enabled providers,
    // (2) create a Stripe PaymentIntent or charge per matched provider,
    // (3) store payment references in match_requests.billing_refs (jsonb column).

    // Persist the match request
    const { error: insertError } = await supabase.from('match_requests').insert({
      buyer_name: name.trim(),
      buyer_email: email.trim().toLowerCase(),
      buyer_company: company?.trim() || null,
      category_id: category.id,
      state_code: stateCode,
      budget: budget || null,
      need: need.trim(),
      matched_provider_ids: matched.map((p) => p.id),
    });

    if (insertError) {
      // Log but don't block — still send emails
      console.error('Failed to persist match request:', insertError);
    }

    // Send emails (non-blocking failures)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      await sendMatchEmails(
        resendKey,
        {
          name: name.trim(),
          email: email.trim(),
          company: company?.trim() || null,
          stateCode,
          budget: budget || null,
          need: need.trim(),
          categoryName: category.name,
        },
        matched,
      );
    } else {
      console.log(
        `[CyberBench] Get Matched: ${name} (${email}) seeking ${category.name} — matched ${matched.length} providers. No RESEND_API_KEY, skipping email.`,
      );
    }

    return NextResponse.json({
      success: true,
      matchCount: matched.length,
      providers: matched.map((p) => ({ name: p.name, slug: p.slug })),
    });
  } catch (err) {
    console.error('Get Matched error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
