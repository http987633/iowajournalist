import Link from "next/link";
import type { Article } from "@prisma/client";
import { parseTags } from "@/lib/slug";

export function ArticleCard({ article }: { article: Article }) {
  const tags = parseTags(article.tags);

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-300 hover:shadow-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        {article.category && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
            {article.category}
          </span>
        )}
        {article.publishedAt && (
          <time dateTime={article.publishedAt.toISOString()}>
            {article.publishedAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}
      </div>
      <h2 className="text-xl font-semibold text-zinc-900">
        <Link href={`/articles/${article.slug}`} className="hover:text-blue-700">
          {article.title}
        </Link>
      </h2>
      {article.excerpt && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600">
          {article.excerpt}
        </p>
      )}
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
