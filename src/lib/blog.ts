import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  image: string | null;
  tags: string[];
  content: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  image: string | null;
  tags: string[];
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));

  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
    const { data } = matter(raw);

    return {
      slug: data.slug || file.replace(/\.md$/, ''),
      title: data.title || 'Untitled',
      description: data.description || '',
      author: data.author || 'CyberBench Team',
      date: data.date || '',
      image: data.image || null,
      tags: data.tags || [],
    };
  });

  // Sort by date descending
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  if (!fs.existsSync(BLOG_DIR)) return null;

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));

  for (const file of files) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
    const { data, content } = matter(raw);
    const postSlug = data.slug || file.replace(/\.md$/, '');

    if (postSlug === slug) {
      return {
        slug: postSlug,
        title: data.title || 'Untitled',
        description: data.description || '',
        author: data.author || 'CyberBench Team',
        date: data.date || '',
        image: data.image || null,
        tags: data.tags || [],
        content,
      };
    }
  }

  return null;
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

// Simple markdown → HTML (no external lib needed for basic rendering)
export function renderMarkdown(md: string): string {
  let html = md;

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="mt-8 mb-3 text-xl font-semibold text-foreground">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="mt-10 mb-4 text-2xl font-bold text-foreground">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h2 class="mt-10 mb-4 text-3xl font-bold text-foreground">$1</h2>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[var(--cyan)] hover:underline">$1</a>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-6 list-disc text-muted-foreground">$1</li>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-6 list-decimal text-muted-foreground">$1</li>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-8 border-border" />');

  // Tables
  html = html.replace(/\|(.+)\|/g, (match) => {
    const cells = match.split('|').filter((c) => c.trim());
    if (cells.every((c) => /^[\s-:]+$/.test(c))) return ''; // skip separator row
    const isHeader = false; // simplified
    const cellHtml = cells
      .map((c) => `<td class="border border-border px-3 py-2 text-sm">${c.trim()}</td>`)
      .join('');
    return `<tr>${cellHtml}</tr>`;
  });

  // Paragraphs (lines that aren't already HTML)
  html = html
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<')) return trimmed;
      if (trimmed.startsWith('<li')) return `<ul class="my-4 space-y-1">${trimmed}</ul>`;
      return `<p class="my-4 leading-relaxed text-muted-foreground">${trimmed.replace(/\n/g, '<br />')}</p>`;
    })
    .join('\n');

  return html;
}
