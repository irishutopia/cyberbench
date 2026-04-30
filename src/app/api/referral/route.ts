import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scan_id, domain, risk_score, provider_id, utm_source, utm_medium, utm_campaign, landing_page } = body;

    const supabase = createAdminClient();
    const { data, error } = await supabase.from('threatscope_referrals').insert({
      scan_id: scan_id || null,
      domain_scanned: domain || null,
      risk_score: risk_score || null,
      provider_id: provider_id || null,
      utm_source: utm_source || 'threatscope',
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      landing_page: landing_page || null,
    }).select().single();

    if (error) {
      console.error('Referral tracking error:', error);
      return NextResponse.json({ error: 'Failed to track referral' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Referral API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
