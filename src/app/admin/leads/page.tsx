import { Metadata } from 'next';
import { Mail, Building, Calendar, Globe } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'All Leads — Admin',
};

export default async function AdminLeadsPage() {
  const supabase = createAdminClient();

  const { data: leads } = await supabase
    .from('contact_submissions')
    .select('*, providers(name, slug)')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">All Leads & Submissions</h1>
        <span className="text-sm text-muted-foreground">{leads?.length || 0} total</span>
      </div>

      {!leads || leads.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{lead.name}</h3>
                    {lead.service_needed && (
                      <span className="rounded-full bg-[var(--cyan)]/10 px-2.5 py-0.5 text-xs text-[var(--cyan)]">
                        {lead.service_needed}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {lead.email}
                    </span>
                    {lead.company && (
                      <span className="flex items-center gap-1">
                        <Building className="h-3.5 w-3.5" />
                        {lead.company}
                      </span>
                    )}
                    {(lead.providers as { name: string } | null)?.name && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5" />
                        {(lead.providers as { name: string }).name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(lead.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                {lead.source_page && (
                  <span className="text-xs text-muted-foreground">
                    from: {lead.source_page}
                  </span>
                )}
              </div>
              {lead.message && (
                <p className="mt-3 text-sm text-muted-foreground">{lead.message}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
