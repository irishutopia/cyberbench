import assert from 'node:assert/strict';
import test from 'node:test';
import { foundingTermEnd, renewalStage } from './founding-renewal.ts';

const emptyReminders = {
  founding_reminder_60_sent_at: null,
  founding_reminder_30_sent_at: null,
  founding_overdue_sent_at: null,
};

test('foundingTermEnd preserves the purchase time one calendar year later', () => {
  assert.equal(
    foundingTermEnd('2026-08-20T18:00:00.000Z'),
    '2027-08-20T18:00:00.000Z'
  );
  assert.equal(
    foundingTermEnd('2028-02-29T18:00:00.000Z'),
    '2029-02-28T18:00:00.000Z'
  );
});

test('renewalStage selects each reminder window once', () => {
  const now = new Date('2027-07-01T00:00:00.000Z');
  assert.equal(renewalStage({ ...emptyReminders, founding_term_ends_at: '2027-08-20T00:00:00.000Z' }, now), '60_day');
  assert.equal(renewalStage({ ...emptyReminders, founding_term_ends_at: '2027-07-20T00:00:00.000Z' }, now), '30_day');
  assert.equal(renewalStage({ ...emptyReminders, founding_term_ends_at: '2027-06-30T00:00:00.000Z' }, now), 'overdue');
  assert.equal(renewalStage({ ...emptyReminders, founding_term_ends_at: '2027-08-20T00:00:00.000Z', founding_reminder_60_sent_at: now.toISOString() }, now), 'none');
});
