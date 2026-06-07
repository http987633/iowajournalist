import { notFound } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { ArticleForm } from "@/components/ArticleForm";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Params) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <div>
      <AdminNav />
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Edit Article</h1>
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <ArticleForm mode="edit" article={article} />
      </div>
    </div>
  );
}
