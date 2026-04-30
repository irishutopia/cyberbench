import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import ClaimActions from './ClaimActions';

export const metadata: Metadata = {
  title: 'Review Claims — Admin',
};

export default async function AdminClaimsPage() {
  const supabase = createAdminClient();

  const { data: claims } = await supabase
    .from('claim_requests')
    .select('*, providers(id, name, slug)')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Claim Requests</h1>

      {!claims || claims.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No claim requests found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{claim.full_name}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      claim.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                      claim.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <strong>Provider:</strong>{' '}
                    {(claim.providers as { name: string; slug: string } | null)?.name || 'N/A'}
                  </p>
                  <div className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                    <p><strong>Title:</strong> {claim.job_title}</p>
                    <p><strong>Email:</strong> {claim.work_email}</p>
                    {claim.phone && <p><strong>Phone:</strong> {claim.phone}</p>}
                    <p><strong>Submitted:</strong>{' '}
                      {new Date(claim.created_at).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                  {claim.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      <strong>Notes:</strong> {claim.notes}
                    </p>
                  )}
                </div>

                {claim.status === 'pending' && (
                  <ClaimActions
                    claimId={claim.id}
                    userId={claim.user_id}
                    providerId={(claim.providers as { id: string } | null)?.id || ''}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
