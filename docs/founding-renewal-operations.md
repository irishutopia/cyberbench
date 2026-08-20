# Founding renewal operations

CyberBench's $499 Founding offer uses a one-time Stripe payment for a one-year
term. It is not an automatically renewing subscription.

## Automated control

- The founding webhook records `founding_term_ends_at` one calendar year after payment.
- A daily Vercel cron calls `/api/cron/founding-renewals` at 14:00 UTC.
- The endpoint requires `CRON_SECRET`, emails `ADMIN_EMAILS` at 60 days, 30 days,
  and when overdue, then records each reminder so it is sent only once.
- Overdue terms are marked `renewal_due`. The job intentionally does not remove
  verification because a provider may qualify for verification independently.

## Renewal process

1. Review **Admin → Founding Renewals** when a reminder arrives.
2. Contact the provider and arrange the next $499 annual payment separately.
3. After confirmed payment, click **Record renewal**. This extends the term by one
   year and clears the reminder timestamps for the next cycle.
4. If the provider declines, click **Expire**. This records the decision but does
   not remove verification; founding placement/badge policy remains a separate
   deliberate commercial decision.

Apply migration `010_founding_renewal_tracking.sql` before deploying the code.
Ensure `CRON_SECRET`, `RESEND_API_KEY`, and `ADMIN_EMAILS` are set in production.
