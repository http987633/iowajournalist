import { ArticleCard } from "@/components/ArticleCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Articles",
  description: "Articles, guides, and insights for journalists in Iowa.",
};

export default async function ArticlesPage() {
  let articles: Awaited<ReturnType<typeof prisma.article.findMany>> = [];

  try {
    articles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    articles = [];
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold text-zinc-900">Articles</h1>
      <p className="mt-2 text-zinc-600">
        Guides, commentary, and resources for Iowa journalists.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {articles.length === 0 && (
        <p className="mt-8 text-zinc-500">No articles published yet.</p>
      )}
    </div>
  );
}
