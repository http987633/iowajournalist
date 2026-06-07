import { generateArticleWithGemini } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { pickTopicFromPool } from "@/lib/topic-pool";
import { tagsToString } from "@/lib/slug";

export async function generateAndSaveArticle(options: {
  keyword?: string;
  category?: string;
  publish: boolean;
}) {
  let keyword = options.keyword;
  let category = options.category;
  let topicId: string | undefined;

  if (!keyword) {
    const topic = await prisma.topicQueue.findFirst({
      where: { used: false },
      orderBy: { createdAt: "asc" },
    });

    if (topic) {
      keyword = topic.keyword;
      category = topic.category || undefined;
      topicId = topic.id;
    } else {
      const recentTitles = await prisma.article.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
        select: { title: true },
      });
      keyword = pickTopicFromPool(recentTitles.map((a) => a.title));
    }
  }

  const { article, model, prompt } = await generateArticleWithGemini(
    keyword,
    category
  );

  const status = options.publish ? "PUBLISHED" : "DRAFT";

  const existingSlug = await prisma.article.findUnique({
    where: { slug: article.slug },
  });
  const slug = existingSlug ? `${article.slug}-${Date.now()}` : article.slug;

  const saved = await prisma.article.create({
    data: {
      title: article.title,
      slug,
      excerpt: article.excerpt,
      content: article.content,
      status,
      source: "GEMINI_AUTO",
      category: article.category,
      tags: tagsToString(article.tags),
      metaTitle: article.metaTitle,
      metaDesc: article.metaDesc,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });

  if (topicId) {
    await prisma.topicQueue.update({
      where: { id: topicId },
      data: { used: true },
    });
  }

  await prisma.generationLog.create({
    data: {
      articleId: saved.id,
      prompt,
      model,
      success: true,
    },
  });

  return saved;
}
