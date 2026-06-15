import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'jwilson@viso.group').split(',').map((e) => e.trim().toLowerCase());

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Send the vendor a welcome email after their claim is approved.
 * Failures are logged but never block the response.
 */
async function sendVendorWelcomeEmail(
  vendorEmail: string,
  providerName: string,
  providerSlug: string
) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log(`[CyberBench] Claim approved for ${vendorEmail} — no RESEND_API_KEY, skipping welcome email`);
    return;
  }

  const loginUrl = 'https://www.cyberbench.net/auth/login';
  const listingUrl = `https://www.cyberbench.net/providers/${escapeHtml(providerSlug)}`;
  const safeName = escapeHtml(providerName);

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
          <h1 style="color:#0a0f1e;font-size:22px;margin:0 0 16px">Your listing is live!</h1>
          <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px">
            Your claim for <strong>${safeName}</strong> has been approved and your listing is now live on CyberBench.
          </p>
          <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px">
            Sign in with this email address to access your vendor dashboard, manage your profile, view leads, and upgrade your listing.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 24px">
            <tr>
              <td style="background:#00d4ff;border-radius:6px;padding:12px 28px">
                <a href="${loginUrl}" style="color:#0a0f1e;font-size:15px;font-weight:700;text-decoration:none">Sign in to your dashboard →</a>
              </td>
            </tr>
          </table>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 8px">
            View your public listing: <a href="${listingUrl}" style="color:#00d4ff">${listingUrl}</a>
          </p>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px">
            From the dashboard you can edit your profile, view buyer leads, and upgrade to Verified ($99/mo) or Featured ($299/mo) for more visibility.
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

  const text = `Your CyberBench listing is live!

Your claim for "${providerName}" has been approved.

Sign in at ${loginUrl} using this email address to access your vendor dashboard.

From the dashboard you can:
- Edit your profile
- View buyer leads and match requests
- Upgrade to Verified ($99/mo) or Featured ($299/mo) for more visibility

View your public listing: ${listingUrl}

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
        to: vendorEmail,
        subject: `Your CyberBench listing is live — ${providerName}`,
        html,
        text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error('Resend vendor welcome error:', res.status, body);
    }
  } catch (err) {
    console.error('Failed to send vendor welcome email:', err);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const admin = createAdminClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { provider_id } = body;

    // Fetch the full claim so we can get work_email and provider_id
    const { data: claim, error: claimFetchError } = await admin
      .from('claim_requests')
      .select('id, work_email, provider_id, full_name')
      .eq('id', id)
      .single();

    if (claimFetchError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    const workEmail: string = claim.work_email;

    // Update claim status
    const { error: claimError } = await admin
      .from('claim_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.email,
      })
      .eq('id', id);

    if (claimError) {
      return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 });
    }

    // Determine which provider to claim — prefer body, fall back to claim record
    const targetProviderId: string | null = provider_id ?? claim.provider_id ?? null;

    // ---------------------------------------------------------------
    // ACCOUNT LINKING: find or create an auth user for the work_email
    // so the vendor can sign in and see their listing in /dashboard.
    // ---------------------------------------------------------------
    let vendorUserId: string | null = null;
    if (workEmail) {
      try {
        // Try to find an existing auth user with this email
        const { data: listData } = await admin.auth.admin.listUsers({ perPage: 1000 });
        const existing = listData?.users?.find(
          (u) => u.email?.toLowerCase() === workEmail.toLowerCase()
        );

        if (existing) {
          vendorUserId = existing.id;
        } else {
          // Create the user so they can sign in via magic link
          const { data: created, error: createErr } = await admin.auth.admin.createUser({
            email: workEmail,
            email_confirm: true,
          });
          if (createErr) {
            console.error('Failed to create auth user for vendor:', createErr);
          } else {
            vendorUserId = created.user?.id ?? null;
          }
        }
      } catch (authErr) {
        // Non-fatal — log and continue; claimed_by stays null but the provider
        // is still marked claimed
        console.error('Auth user lookup/creation error:', authErr);
      }
    }

    // Mark the provider claimed with the resolved user ID
    if (targetProviderId) {
      await admin
        .from('providers')
        .update({
          is_claimed: true,
          is_verified: true,
          claimed_by: vendorUserId,
          claimed_at: new Date().toISOString(),
          // NOTE: deliberately do NOT touch `status` — it controls directory
          // visibility (getProviderBySlug filters status='active'). The
          // claimed/verified badges key off is_claimed / is_verified instead.
        })
        .eq('id', targetProviderId);
    }

    // Send vendor welcome email (non-blocking)
    if (workEmail && targetProviderId) {
      const { data: provider } = await admin
        .from('providers')
        .select('name, slug')
        .eq('id', targetProviderId)
        .single();
      if (provider) {
        await sendVendorWelcomeEmail(workEmail, provider.name, provider.slug);
      }
    }

    return NextResponse.json({ success: true, vendorUserId });
  } catch (err) {
    console.error('Approve claim error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
