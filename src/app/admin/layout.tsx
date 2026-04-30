import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Shield, LayoutDashboard, Users, CheckSquare, MessageSquare, BarChart3 } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'jwilson@viso.group').split(',').map((e) => e.trim().toLowerCase());

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
    redirect('/auth/login?redirect=/admin');
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/claims', label: 'Claim Requests', icon: CheckSquare },
    { href: '/admin/providers', label: 'Providers', icon: Users },
    { href: '/admin/leads', label: 'All Leads', icon: MessageSquare },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-4 flex items-center gap-2 px-2">
              <Shield className="h-5 w-5 text-red-400" />
              <span className="font-semibold text-foreground">Admin Panel</span>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-[var(--navy)] hover:text-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 border-t border-border pt-3 px-2">
              <p className="text-xs text-muted-foreground">
                Signed in as {user.email}
              </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
