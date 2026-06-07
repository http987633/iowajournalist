# Iowa Journalist (iowajournalist.org)

Iowa journalism resource site with admin CMS and Gemini AI auto-publishing.

## Features

- Public site: articles, resources, about, SEO (sitemap, robots, JSON-LD)
- Admin panel: `/admin` — manual article CRUD
- Gemini API: auto-generate articles from topic queue
- Vercel Cron: daily auto-generation + hourly scheduled publish

## Quick Deploy (Vercel)

### 1. Database (Neon PostgreSQL — free)

1. Go to [https://neon.tech](https://neon.tech) and create a project
2. Copy the connection string (with `?sslmode=require`)
3. In Vercel → Project → Settings → Environment Variables, add:

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | `postgresql://...?sslmode=require` |
| `NEXT_PUBLIC_SITE_URL` | `https://iowajournalist.org` |
| `ADMIN_PASSWORD` | your strong password |
| `ADMIN_SECRET` | random 32+ char string |
| `GEMINI_API_KEY` | from Google AI Studio |
| `CRON_SECRET` | random secret string |
| `AUTO_PUBLISH_GEMINI` | `false` |

### 2. Deploy

Push to GitHub → Import in [Vercel](https://vercel.com) → Deploy.

Build command (default): `prisma generate && prisma db push && next build`

### 3. Seed data

After first deploy, run locally or in Vercel shell:

```bash
npm run db:seed
```

### 4. Custom domain

Vercel → Project → Settings → Domains → Add `iowajournalist.org`

Update DNS at your registrar:

- Type `A` → `76.76.21.21`
- Or Type `CNAME` → `cname.vercel-dns.com`

## Local Development

```bash
cp .env.example .env
# Fill in DATABASE_URL and other vars

npm install
npm run db:push
npm run db:seed
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin

## Admin Usage

1. Go to `/admin/login`
2. Create articles manually at `/admin/articles/new`
3. Add topics at `/admin/topics`
4. Generate with Gemini at `/admin/generate`
5. Review drafts and publish

## Cron Jobs

Defined in `vercel.json`:

- Daily 14:00 UTC — generate 1 article from topic queue
- Hourly — publish scheduled articles

Cron requests must include header: `Authorization: Bearer {CRON_SECRET}`
