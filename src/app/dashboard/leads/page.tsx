import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { MessageSquare, Mail, Building, Calendar } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Leads — Dashboard',
};

export default async function LeadsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/dashboard/leads');

  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('claimed_by', user.id)
    .single();

  if (!provider) redirect('/dashboard');

  const { data: leads } = await supabase
    .from('contact_submissions')
    .select('*')
    .eq('provider_id', provider.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Leads & Inquiries</h1>
        <p className="mt-1 text-muted-foreground">
          Contact submissions from potential customers.
        </p>
      </div>

      {!leads || leads.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">No leads yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            When potential customers submit a contact form on your listing, their
            inquiries will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground">{lead.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-[var(--cyan)] hover:underline"
                      >
                        {lead.email}
                      </a>
                    </span>
                    {lead.company && (
                      <span className="flex items-center gap-1">
                        <Building className="h-3.5 w-3.5" />
                        {lead.company}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(lead.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                {lead.service_needed && (
                  <span className="rounded-full bg-[var(--cyan)]/10 px-3 py-0.5 text-xs text-[var(--cyan)]">
                    {lead.service_needed}
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
