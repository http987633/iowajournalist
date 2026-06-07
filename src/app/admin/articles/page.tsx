import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <AdminNav />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          New Article
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-600">Title</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Source</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Updated</th>
              <th className="px-4 py-3 font-medium text-zinc-600"></th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {article.title}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      article.status === "PUBLISHED"
                        ? "bg-green-50 text-green-700"
                        : article.status === "SCHEDULED"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {article.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500">{article.source}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {article.updatedAt.toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/articles/${article.id}/edit`}
                    className="text-blue-700 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length === 0 && (
          <p className="p-8 text-center text-zinc-500">No articles yet.</p>
        )}
      </div>
    </div>
  );
}
