import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import ProfileEditor from './ProfileEditor';

export const metadata: Metadata = {
  title: 'Edit Profile — Dashboard',
};

export default async function ProfilePage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/dashboard/profile');

  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('claimed_by', user.id)
    .single();

  if (!provider) {
    redirect('/dashboard');
  }

  // Get all service categories for the editor
  const { data: categories } = await supabase
    .from('service_categories')
    .select('*')
    .order('sort_order');

  // Get provider's current services
  const { data: providerServices } = await supabase
    .from('provider_services')
    .select('category_id')
    .eq('provider_id', provider.id);

  // Get certifications
  const { data: certifications } = await supabase
    .from('certifications')
    .select('*')
    .order('name');

  const { data: providerCerts } = await supabase
    .from('provider_certifications')
    .select('certification_id')
    .eq('provider_id', provider.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Update your company information. Changes will be reflected on your public listing.
        </p>
      </div>

      <ProfileEditor
        provider={provider}
        categories={categories || []}
        selectedServiceIds={(providerServices || []).map((ps) => ps.category_id)}
        certifications={certifications || []}
        selectedCertIds={(providerCerts || []).map((pc) => pc.certification_id)}
      />
    </div>
  );
}
