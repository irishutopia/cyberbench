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
    } = body;

    // Honeypot check
    if (_hp) {
      // Silently accept to not tip off bots
      return NextResponse.json({ success: true, slug: 'submitted' });
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

    // Send admin notification
    await notifyAdmin(companyName.trim(), contactEmail.trim(), slug);

    return NextResponse.json({ success: true, slug });
  } catch (err) {
    console.error('Provider submission error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
