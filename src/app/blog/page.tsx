import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { SITE_NAME } from '@/lib/constants';
import { getAllPosts } from '@/lib/blog';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import ScanCTA from '@/components/scan/ScanCTA';

export const metadata: Metadata = {
  title: `Blog — ${SITE_NAME}`,
  description:
    'Cybersecurity insights, guides, and industry analysis from CyberBench. Learn how to protect your business and choose the right security partners.',
  openGraph: {
    title: `Blog — ${SITE_NAME}`,
    description: 'Cybersecurity insights, guides, and industry analysis.',
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />

      {/* Hero */}
      <section className="border-b border-border bg-[var(--navy-light)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Cyber<span className="text-[var(--cyan)]">Bench</span> Blog
          </h1>
          <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
            Guides, insights, and analysis to help you navigate the cybersecurity landscape.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-[var(--cyan)]/50 hover:shadow-lg hover:shadow-[var(--cyan)]/5"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(post.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {post.author}
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-bold text-foreground group-hover:text-[var(--cyan)] transition-colors">
                  {post.title}
                </h2>

                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {post.description}
                </p>

                {post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-[var(--cyan)]/10 px-2.5 py-0.5 text-xs text-[var(--cyan)]"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--cyan)]">
                  Read more <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12">
          <ScanCTA variant="banner" />
        </div>
      </section>
    </>
  );
}
