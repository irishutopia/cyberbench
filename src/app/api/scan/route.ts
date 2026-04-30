import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, email, name, company } = body;

    if (!domain || !email) {
      return NextResponse.json(
        { error: 'Domain and email are required' },
        { status: 400 }
      );
    }

    // Validate domain format (basic check)
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: 'Please enter a valid domain (e.g., example.com)' },
        { status: 400 }
      );
    }

    // Store scan request as a referral lead
    const supabase = createAdminClient();
    const { error } = await supabase.from('threatscope_referrals').insert({
      domain_scanned: domain,
      utm_source: 'cyberbench',
      utm_medium: 'scan_form',
      utm_campaign: 'free_scan',
      landing_page: '/scan',
    });

    // Also store as a contact submission for lead tracking
    await supabase.from('contact_submissions').insert({
      name: name || 'Scan Request',
      email,
      company: company || null,
      message: `Free ThreatScope scan requested for domain: ${domain}`,
      service_needed: 'threatscope-scan',
      source_page: '/scan',
    });

    if (error) {
      console.error('Scan request storage error:', error);
      // Don't fail the request — still show success to user
    }

    return NextResponse.json({
      success: true,
      message: 'Scan request submitted. Results will be emailed within 24 hours.',
    });
  } catch (err) {
    console.error('Scan API error:', err);
    return NextResponse.json(
      { error: 'Failed to process scan request' },
      { status: 500 }
    );
  }
}
