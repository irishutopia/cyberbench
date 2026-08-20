export type FoundingRenewalStage = 'none' | '60_day' | '30_day' | 'overdue';

export interface FoundingRenewalRecord {
  founding_term_ends_at: string | null;
  founding_reminder_60_sent_at: string | null;
  founding_reminder_30_sent_at: string | null;
  founding_overdue_sent_at: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function foundingTermEnd(purchasedAt: string): string {
  const end = new Date(purchasedAt);
  const purchasedMonth = end.getUTCMonth();
  end.setUTCFullYear(end.getUTCFullYear() + 1);
  // Clamp Feb 29 to Feb 28 instead of allowing Date to roll into March.
  if (end.getUTCMonth() !== purchasedMonth) end.setUTCDate(0);
  return end.toISOString();
}

export function renewalStage(
  provider: FoundingRenewalRecord,
  now = new Date()
): FoundingRenewalStage {
  if (!provider.founding_term_ends_at) return 'none';

  const remainingDays = Math.ceil(
    (new Date(provider.founding_term_ends_at).getTime() - now.getTime()) / DAY_MS
  );

  if (remainingDays < 0 && !provider.founding_overdue_sent_at) return 'overdue';
  if (remainingDays <= 30 && !provider.founding_reminder_30_sent_at) return '30_day';
  if (remainingDays <= 60 && !provider.founding_reminder_60_sent_at) return '60_day';
  return 'none';
}

export function daysUntil(date: string, now = new Date()): number {
  return Math.ceil((new Date(date).getTime() - now.getTime()) / DAY_MS);
}
