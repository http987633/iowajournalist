import { AdminNav } from "@/components/AdminNav";
import { ArticleForm } from "@/components/ArticleForm";

export default function NewArticlePage() {
  return (
    <div>
      <AdminNav />
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">New Article</h1>
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <ArticleForm mode="create" />
      </div>
    </div>
  );
}
