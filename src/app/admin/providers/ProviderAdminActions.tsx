'use client';

import { useState } from 'react';

interface Props {
  providerId: string;
  currentStatus: string;
}

export default function ProviderAdminActions({ providerId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    if (!confirm(`Change status to "${newStatus}"?`)) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/providers/${providerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) window.location.reload();
      else alert('Failed to update');
    } catch {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <span className="text-xs text-muted-foreground">...</span>;

  return (
    <div className="flex justify-end gap-1">
      {currentStatus === 'suspended' ? (
        <button
          onClick={() => updateStatus('active')}
          className="rounded px-2 py-1 text-xs text-green-400 hover:bg-green-500/10"
        >
          Activate
        </button>
      ) : (
        <button
          onClick={() => updateStatus('suspended')}
          className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
        >
          Suspend
        </button>
      )}
    </div>
  );
}
