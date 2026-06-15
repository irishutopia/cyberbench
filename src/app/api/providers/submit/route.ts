import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
}

/** Extract root domain from a URL (e.g., https://www.acme.com/about → acme.com) */
function extractDomain(urlStr: string): string | null {
  try {
    const url = new URL(urlStr);
    const parts = url.hostname.replace(/^www\./, '').split('.');
    // Handle co.uk, com.au, etc.
    if (parts.length >= 2) {
      return parts.slice(-2).join('.');
    }
    return url.hostname;
  } catch {
    return null;
  }
}

/** Check if a website URL is reachable (HEAD request with timeout) */
async function checkWebsiteReachable(urlStr: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(urlStr, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);
    return res.ok || res.status === 403 || res.status === 405;
  } catch {
    // Try GET as fallback (some servers reject HEAD)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(urlStr, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow',
        headers: { Range: 'bytes=0-0' },
      });
      clearTimeout(timeout);
      return res.ok || res.status === 403 || res.status === 206;
    } catch {
      return false;
    }
  }
}

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY || '';

/** Verify Cloudflare Turnstile token */
async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  if (!TURNSTILE_SECRET) {
    console.warn('[CyberBench] No TURNSTILE_SECRET_KEY set, skipping verification');
    return true; // Don't block in dev
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

/** Send submission confirmation email to the vendor */
async function notifyVendor(contactEmail: string, contactName: string, companyName: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  const safeCompany = companyName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeName = contactName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%">
        <tr><td style="background:#0a0f1e;padding:24px 32px">
          <p style="color:#00d4ff;font-size:20px;font-weight:700;margin:0">CyberBench</p>
        </td></tr>
        <tr><td style="padding:32px">
          <h1 style="color:#0a0f1e;font-size:22px;margin:0 0 16px">Listing received — we'll be in touch soon</h1>
          <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px">
            Hi ${safeName},
          </p>
          <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px">
            Thanks for submitting <strong>${safeCompany}</strong> to CyberBench. We've received your listing and our team will review it within 1–2 business days.
          </p>
          <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px">
            Once approved, you'll receive another email with a link to sign in and manage your listing — including editing your profile, viewing buyer leads, and upgrading to a paid tier for more visibility.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px">
          <p style="color:#9ca3af;font-size:13px;margin:0">
            Questions? Reply to this email or contact us at <a href="mailto:jeremy@viso.group" style="color:#00d4ff">jeremy@viso.group</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Hi ${contactName},

Thanks for submitting "${companyName}" to CyberBench. We've received your listing and our team will review it within 1–2 business days.

Once approved, you'll receive another email with a link to sign in and manage your listing.

Questions? Contact us at jeremy@viso.group`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: 'CyberBench <notifications@viso.group>',
        reply_to: 'jeremy@viso.group',
        to: contactEmail,
        subject: `We received your CyberBench listing — ${companyName}`,
        html,
        text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error('Resend vendor submit confirmation error:', res.status, body);
    }
  } catch (err) {
    console.error('Failed to send vendor submission confirmation:', err);
  }
}

/** Send admin notification email about new submission */
async function notifyAdmin(companyName: string, contactEmail: string, slug: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log(`[CyberBench] New submission: ${companyName} (${contactEmail}) — no RESEND_API_KEY, skipping email`);
    return;
  }

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
        subject: `New CyberBench Listing Submission: ${companyName}`,
        html: `
          <h2>New Provider Submission</h2>
          <p><strong>Company:</strong> ${companyName}</p>
          <p><strong>Contact:</strong> ${contactEmail}</p>
          <p><strong>Slug:</strong> ${slug}</p>
          <p><a href="https://cyberbench.net/admin/providers">Review in Admin Panel →</a></p>
        `,
      }),
    });
  } catch (err) {
    console.error('Failed to send admin notification:', err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      companyName,
      website,
      description,
      services,
      city,
      stateCode,
      contactName,
      contactEmail,
      employeeCount,
      foundedYear,
      phone,
      longDescription,
      industriesServed,
      _hp,
      turnstileToken,
    } = body;

    // Honeypot check
    if (_hp) {
      // Silently accept to not tip off bots
      return NextResponse.json({ success: true, slug: 'submitted' });
    }

    // Turnstile verification
    if (!turnstileToken) {
      return NextResponse.json(
        { error: 'Security verification required. Please try again.' },
        { status: 400 }
      );
    }

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    const turnstileValid = await verifyTurnstile(turnstileToken, clientIp);
    if (!turnstileValid) {
      return NextResponse.json(
        { error: 'Security verification failed. Please refresh and try again.' },
        { status: 403 }
      );
    }

    // Required field validation
    if (!companyName || !website || !description || !services?.length || !city || !stateCode || !contactName || !contactEmail) {
      return NextResponse.json(
        { error: 'All required fields must be filled out.' },
        { status: 400 }
      );
    }

    // Company name length
    if (companyName.trim().length < 2 || companyName.trim().length > 100) {
      return NextResponse.json(
        { error: 'Company name must be between 2 and 100 characters.' },
        { status: 400 }
      );
    }

    // Description length
    if (description.trim().length < 10 || description.trim().length > 500) {
      return NextResponse.json(
        { error: 'Description must be between 10 and 500 characters.' },
        { status: 400 }
      );
    }

    // Website URL validation
    try {
      const url = new URL(website);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json(
        { error: 'Please enter a valid website URL (starting with http:// or https://).' },
        { status: 400 }
      );
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Email domain must match website domain
    const websiteDomain = extractDomain(website);
    const emailDomain = contactEmail.split('@')[1]?.toLowerCase();
    const emailRootDomain = emailDomain ? extractDomain(`https://${emailDomain}`) : null;

    const freeEmailProviders = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
      'icloud.com', 'mail.com', 'protonmail.com', 'zoho.com', 'yandex.com',
      'live.com', 'msn.com', 'me.com', 'gmx.com',
    ];

    let domainMismatch = false;
    if (freeEmailProviders.includes(emailDomain || '')) {
      // Flag but don't block — small providers may use Gmail
      domainMismatch = true;
    } else if (websiteDomain && emailRootDomain && websiteDomain !== emailRootDomain) {
      domainMismatch = true;
    }

    // Website reachability check (non-blocking, just flags)
    let websiteReachable = true;
    try {
      websiteReachable = await checkWebsiteReachable(website.trim());
    } catch {
      websiteReachable = false;
    }

    // Services limit
    if (!Array.isArray(services) || services.length < 1 || services.length > 5) {
      return NextResponse.json(
        { error: 'Please select between 1 and 5 services.' },
        { status: 400 }
      );
    }

    // Founded year validation
    if (foundedYear) {
      const year = parseInt(foundedYear, 10);
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
        return NextResponse.json(
          { error: 'Please enter a valid founding year.' },
          { status: 400 }
        );
      }
    }

    const supabase = createAdminClient();
    const slug = slugify(companyName);

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('providers')
      .select('slug, name')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error: `A company with a similar name already exists: "${existing.name}". If this is your company, you can claim it instead.`,
          existingProvider: { slug: existing.slug, name: existing.name },
        },
        { status: 409 }
      );
    }

    // Check for near-duplicate names (case-insensitive)
    const { data: similarName } = await supabase
      .from('providers')
      .select('slug, name')
      .ilike('name', companyName.trim())
      .maybeSingle();

    if (similarName) {
      return NextResponse.json(
        {
          error: `A company named "${similarName.name}" already exists. If this is your company, you can claim it instead.`,
          existingProvider: { slug: similarName.slug, name: similarName.name },
        },
        { status: 409 }
      );
    }

    // Look up valid service category IDs
    const { data: validCategories } = await supabase
      .from('service_categories')
      .select('id, slug')
      .in('slug', services);

    if (!validCategories || validCategories.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one valid service category.' },
        { status: 400 }
      );
    }

    // US_STATES validation
    const validStates = [
      'AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL','GA','HI','ID','IL',
      'IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE',
      'NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD',
      'TN','TX','UT','VT','VA','WA','WV','WI','WY',
    ];
    if (!validStates.includes(stateCode)) {
      return NextResponse.json(
        { error: 'Please select a valid US state.' },
        { status: 400 }
      );
    }

    // Build trust flags for admin review
    const trustFlags: string[] = [];
    if (domainMismatch) trustFlags.push('email_domain_mismatch');
    if (!websiteReachable) trustFlags.push('website_unreachable');

    // Insert provider
    const { data: provider, error: insertError } = await supabase
      .from('providers')
      .insert({
        slug,
        name: companyName.trim(),
        description: description.trim(),
        long_description: longDescription?.trim() || null,
        website: website.trim(),
        city: city.trim(),
        state_code: stateCode,
        country: 'US',
        employee_count: employeeCount || null,
        founded_year: foundedYear ? parseInt(foundedYear, 10) : null,
        contact_email: contactEmail.trim().toLowerCase(),
        contact_phone: phone?.trim() || null,
        industries_served: industriesServed?.length ? industriesServed : null,
        status: 'draft',
        tier: 'free',
        is_claimed: false,
        // Store trust flags in meta_description temporarily (no schema change needed)
        meta_description: trustFlags.length > 0 ? `[TRUST_FLAGS: ${trustFlags.join(', ')}]` : null,
      })
      .select('id')
      .single();

    if (insertError || !provider) {
      console.error('Provider insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit your listing. Please try again.' },
        { status: 500 }
      );
    }

    // Insert service category mappings
    const serviceMappings = validCategories.map((cat, idx) => ({
      provider_id: provider.id,
      category_id: cat.id,
      is_primary: idx === 0,
    }));

    const { error: mappingError } = await supabase
      .from('provider_services')
      .insert(serviceMappings);

    if (mappingError) {
      console.error('Service mapping error:', mappingError);
      // Non-fatal — the provider is still created
    }

    // Notify admin and confirm receipt to vendor (non-blocking)
    await notifyAdmin(companyName.trim(), contactEmail.trim(), slug);
    await notifyVendor(contactEmail.trim(), contactName.trim(), companyName.trim());

    return NextResponse.json({ success: true, slug });
  } catch (err) {
    console.error('Provider submission error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
