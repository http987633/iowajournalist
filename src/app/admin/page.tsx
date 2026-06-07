import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [published, drafts, topics, logs] = await Promise.all([
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.topicQueue.count({ where: { used: false } }),
    prisma.generationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div>
      <AdminNav />
      <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Published</p>
          <p className="mt-1 text-3xl font-bold">{published}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Drafts</p>
          <p className="mt-1 text-3xl font-bold">{drafts}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">Topics in Queue</p>
          <p className="mt-1 text-3xl font-bold">{topics}</p>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/admin/articles/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          New Article
        </Link>
        <Link
          href="/admin/generate"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          AI Generate
        </Link>
      </div>

      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="font-semibold text-zinc-900">Recent AI Generation Logs</h2>
        {logs.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No generation logs yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {logs.map((log) => (
              <li key={log.id} className="flex items-center gap-2">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${log.success ? "bg-green-500" : "bg-red-500"}`}
                />
                <span className="text-zinc-600">
                  {log.createdAt.toLocaleString()} — {log.model}
                  {log.error && ` — ${log.error}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
