"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";

export default function AdminGeneratePage() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; slug?: string } | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: keyword || undefined }),
    });

    const data = await res.json();

    if (res.ok) {
      setResult({
        success: true,
        message: `Article created as ${data.article.status}`,
        slug: data.article.slug,
      });
    } else {
      setResult({ success: false, message: data.error || "Generation failed" });
    }
    setLoading(false);
  }

  return (
    <div>
      <AdminNav />
      <h1 className="text-2xl font-bold text-zinc-900">AI Generate Article</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Uses Gemini API. Leave keyword empty to pull from topic queue.
      </p>

      <form
        onSubmit={handleGenerate}
        className="mt-6 max-w-lg rounded-xl border border-zinc-200 bg-white p-6"
      >
        <label className="block text-sm font-medium text-zinc-700">
          Keyword (optional)
        </label>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Leave empty to use next topic in queue"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate with Gemini"}
        </button>
      </form>

      {result && (
        <div
          className={`mt-4 max-w-lg rounded-lg p-4 text-sm ${
            result.success
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          <p>{result.message}</p>
          {result.slug && (
            <p className="mt-2">
              <Link
                href={`/admin/articles`}
                className="font-medium underline"
              >
                Review in Articles →
              </Link>
            </p>
          )}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
        <h2 className="font-semibold text-zinc-900">Auto-generation (Cron)</h2>
        <p className="mt-2">
          Vercel 每天 <strong>14:00 UTC</strong>（爱荷华时间约早上 8–9 点）自动调用 Gemini
          生成 <strong>1 篇文章并直接发布</strong>。话题队列为空时会从内置话题池随机选取。
        </p>
      </div>
    </div>
  );
}
