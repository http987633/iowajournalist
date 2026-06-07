import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkdownContent } from "@/components/MarkdownContent";
import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/slug";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const article = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
  });

  if (!article) return { title: "Article Not Found" };

  return {
    title: article.metaTitle || article.title,
    description: article.metaDesc || article.excerpt,
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDesc || article.excerpt || undefined,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      url: `${siteConfig.url}/articles/${article.slug}`,
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
  });

  if (!article) notFound();

  const tags = parseTags(article.tags);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
        <Link href="/articles" className="text-blue-700 hover:underline">
          ← Articles
        </Link>
        {article.category && (
          <>
            <span>·</span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
              {article.category}
            </span>
          </>
        )}
        {article.publishedAt && (
          <>
            <span>·</span>
            <time dateTime={article.publishedAt.toISOString()}>
              {article.publishedAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </>
        )}
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
        {article.title}
      </h1>

      {article.excerpt && (
        <p className="mt-4 text-lg leading-relaxed text-zinc-600">
          {article.excerpt}
        </p>
      )}

      {tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-10 border-t border-zinc-200 pt-10">
        <MarkdownContent content={article.content} />
      </div>

      {article.outboundUrl && (
        <div className="mt-10 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm">
          <span className="font-medium text-zinc-700">Related: </span>
          <a
            href={article.outboundUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:underline"
          >
            {article.outboundUrl}
          </a>
        </div>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.excerpt,
            datePublished: article.publishedAt?.toISOString(),
            dateModified: article.updatedAt.toISOString(),
            author: {
              "@type": "Organization",
              name: siteConfig.name,
            },
            publisher: {
              "@type": "Organization",
              name: siteConfig.name,
              url: siteConfig.url,
            },
            mainEntityOfPage: `${siteConfig.url}/articles/${article.slug}`,
          }),
        }}
      />
    </article>
  );
}
