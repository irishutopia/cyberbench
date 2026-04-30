'use client';

import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';

interface ClaimActionsProps {
  claimId: string;
  userId: string;
  providerId: string;
}

export default function ClaimActions({ claimId, userId, providerId }: ClaimActionsProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  async function handleAction(action: 'approve' | 'reject') {
    if (!confirm(`Are you sure you want to ${action} this claim?`)) return;
    setStatus('loading');

    try {
      const res = await fetch(`/api/admin/claims/${claimId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, provider_id: providerId }),
      });

      if (res.ok) {
        setStatus('done');
        window.location.reload();
      } else {
        alert('Action failed. Check console for details.');
        setStatus('idle');
      }
    } catch {
      alert('Network error');
      setStatus('idle');
    }
  }

  if (status === 'done') return null;
  if (status === 'loading') {
    return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction('approve')}
        className="inline-flex items-center gap-1 rounded-lg bg-green-500/10 px-3 py-1.5 text-sm text-green-400 hover:bg-green-500/20"
      >
        <Check className="h-4 w-4" />
        Approve
      </button>
      <button
        onClick={() => handleAction('reject')}
        className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20"
      >
        <X className="h-4 w-4" />
        Reject
      </button>
    </div>
  );
}
