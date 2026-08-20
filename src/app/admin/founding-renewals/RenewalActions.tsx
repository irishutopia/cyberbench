'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RenewalActions({ providerId }: { providerId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function update(action: 'renew' | 'expire') {
    if (action === 'renew' && !window.confirm('Confirm payment was received and extend this term by one year?')) return;
    if (action === 'expire' && !window.confirm('Mark this founding term expired?')) return;
    setBusy(true);
    setError('');
    const response = await fetch(`/api/admin/founding-renewals/${providerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error || 'Update failed');
      setBusy(false);
      return;
    }
    router.refresh();
    setBusy(false);
  }

  return <div className="flex flex-col items-end gap-1">
    <div className="flex gap-2">
      <button disabled={busy} onClick={() => update('renew')} className="rounded bg-green-500/15 px-2 py-1 text-xs text-green-400 disabled:opacity-50">Record renewal</button>
      <button disabled={busy} onClick={() => update('expire')} className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-400 disabled:opacity-50">Expire</button>
    </div>
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>;
}
