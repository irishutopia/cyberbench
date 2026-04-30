# CyberBench 🛡️

**"Angie's List for Cybersecurity"** — The trusted directory for finding and comparing cybersecurity service providers.

**Domain:** [cyberbench.net](https://cyberbench.net)  
**Built by:** [VISO Group](https://viso.group)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS + shadcn/ui |
| Hosting | Vercel |
| Search | PostgreSQL full-text search (tsvector) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account (optional — app works with seed data fallback)

### Setup

```bash
# Clone the repo
git clone https://github.com/viso-group/cyberbench.git
cd cyberbench

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# (Optional) Add your Supabase credentials to .env.local
# The app works without Supabase using built-in seed data

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Supabase Setup (Optional)

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL editor
3. Add your credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## Project Structure

```
cyberbench/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Homepage
│   │   ├── providers/          # Provider listing + profiles
│   │   ├── services/           # Service category pages
│   │   ├── about/              # About page
│   │   ├── claim/              # Claim listing page
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Header, Footer, SearchBar
│   │   ├── providers/          # ProviderCard, Grid, Filters
│   │   └── seo/                # JSON-LD structured data
│   └── lib/
│       ├── data.ts             # Data fetching layer
│       ├── seed-data.ts        # 50 providers, 20 categories, 50 cities
│       ├── types.ts            # TypeScript types
│       ├── constants.ts        # Site config
│       ├── utils.ts            # Helpers
│       └── supabase/           # Supabase clients
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Full database schema
├── public/
└── ...config files
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, search, featured categories, stats |
| `/providers` | Browse all providers with search, filters, pagination |
| `/providers/[slug]` | Individual provider profile with JSON-LD |
| `/services` | All service categories with provider counts |
| `/services/[slug]` | Category page with filtered providers |
| `/about` | About CyberBench |
| `/claim` | Claim your listing landing page |

## API Routes

| Route | Description |
|-------|-------------|
| `GET /api/providers` | List/search providers (supports `q`, `category`, `state`, `city`, `page`) |
| `GET /api/search?q=` | Full-text search across providers |
| `GET /api/categories` | List all service categories with provider counts |

## Seed Data

The app includes built-in seed data that works without a database:

- **50 real cybersecurity companies** (CrowdStrike, Palo Alto, Rapid7, etc.)
- **20 service categories** (Penetration Testing, MSSP, vCISO, etc.)
- **50 US cities** (Houston, New York, Chicago, etc.)

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# (or use: vercel env add)
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Supabase service role key (server-side only) |

## Roadmap

### ✅ Week 1 (Foundation)
- [x] Next.js 15 project setup with TypeScript, Tailwind, shadcn/ui
- [x] Dark navy theme with cyan accents
- [x] Database schema (SQL migration)
- [x] Seed data (50 providers, 20 categories, 50 cities)
- [x] Homepage with hero, search, featured categories
- [x] Provider listing with filters and pagination
- [x] Provider profile pages with JSON-LD
- [x] Service category pages
- [x] Full-text search API + UI
- [x] Responsive layout (Header/Footer)

### 🔜 Week 2 (SEO + Claims)
- [ ] Location pages (state → city → service combos)
- [ ] Dynamic sitemap.xml
- [ ] Meta tags and OG images
- [ ] Auth system (Supabase Auth)
- [ ] Claim listing flow
- [ ] Contact/lead forms
- [ ] Admin panel

### 🔜 Week 3 (Integration + Polish)
- [ ] ThreatScope integration
- [ ] Provider dashboard
- [ ] Analytics
- [ ] Blog
- [ ] Performance optimization

## License

Proprietary — VISO Group © 2026
