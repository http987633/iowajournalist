import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let articles: Awaited<ReturnType<typeof prisma.article.findMany>> = [];

  try {
    articles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 6,
    });
  } catch {
    articles = [];
  }

  return (
    <div>
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Iowa Journalism
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            {siteConfig.tagline}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600">
            {siteConfig.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/articles"
              className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
            >
              Browse Articles
            </Link>
            <Link
              href="/resources"
              className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Journalism Resources
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">Latest Articles</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Guides, insights, and resources for Iowa journalists
            </p>
          </div>
          <Link href="/articles" className="text-sm font-medium text-blue-700 hover:underline">
            View all →
          </Link>
        </div>

        {articles.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
            <p className="text-zinc-500">No published articles yet.</p>
            <p className="mt-2 text-sm text-zinc-400">
              Add articles from the{" "}
              <Link href="/admin" className="text-blue-700 hover:underline">
                admin panel
              </Link>
              .
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
