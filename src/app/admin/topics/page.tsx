"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/AdminNav";

type Topic = {
  id: string;
  keyword: string;
  category: string | null;
  used: boolean;
  createdAt: string;
};

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [keyword, setKeyword] = useState("");
  const [bulk, setBulk] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadTopics() {
    const res = await fetch("/api/admin/topics");
    if (res.ok) setTopics(await res.json());
  }

  useEffect(() => {
    loadTopics();
  }, []);

  async function addTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    await fetch("/api/admin/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword }),
    });
    setKeyword("");
    await loadTopics();
    setLoading(false);
  }

  async function addBulk(e: React.FormEvent) {
    e.preventDefault();
    if (!bulk.trim()) return;
    setLoading(true);
    await fetch("/api/admin/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bulk }),
    });
    setBulk("");
    await loadTopics();
    setLoading(false);
  }

  async function deleteTopic(id: string) {
    await fetch(`/api/admin/topics/${id}`, { method: "DELETE" });
    await loadTopics();
  }

  return (
    <div>
      <AdminNav />
      <h1 className="text-2xl font-bold text-zinc-900">Topic Queue</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Topics are consumed by Gemini auto-generation (one per run).
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form onSubmit={addTopic} className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold">Add Single Topic</h2>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. How to file an Iowa FOIA request"
            className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-3 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            Add Topic
          </button>
        </form>

        <form onSubmit={addBulk} className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="font-semibold">Bulk Import</h2>
          <textarea
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder="One topic per line"
            rows={4}
            className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-3 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            Import Topics
          </button>
        </form>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-600">Keyword</th>
              <th className="px-4 py-3 font-medium text-zinc-600">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-600"></th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr key={topic.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 text-zinc-900">{topic.keyword}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      topic.used
                        ? "bg-zinc-100 text-zinc-500"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {topic.used ? "Used" : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => deleteTopic(topic.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {topics.length === 0 && (
          <p className="p-8 text-center text-zinc-500">No topics in queue.</p>
        )}
      </div>
    </div>
  );
}
