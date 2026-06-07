import { NextResponse } from "next/server";
import { isAdminAuthenticated, verifyCronSecret } from "@/lib/auth";
import { generateArticleWithGemini } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { tagsToString } from "@/lib/slug";

export async function POST(request: Request) {
  const isCron = await verifyCronSecret(request);
  const isAdmin = await isAdminAuthenticated();

  if (!isCron && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    let keyword = body.keyword as string | undefined;
    let category = body.category as string | undefined;
    let topicId: string | undefined;

    if (!keyword) {
      const topic = await prisma.topicQueue.findFirst({
        where: { used: false },
        orderBy: { createdAt: "asc" },
      });
      if (!topic) {
        return NextResponse.json({ error: "No topics in queue" }, { status: 404 });
      }
      keyword = topic.keyword;
      category = topic.category || undefined;
      topicId = topic.id;
    }

    const { article, model, prompt } = await generateArticleWithGemini(
      keyword,
      category
    );

    const autoPublish = process.env.AUTO_PUBLISH_GEMINI === "true";
    const status = autoPublish ? "PUBLISHED" : "DRAFT";

    const existingSlug = await prisma.article.findUnique({
      where: { slug: article.slug },
    });

    const slug = existingSlug
      ? `${article.slug}-${Date.now()}`
      : article.slug;

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

    return NextResponse.json({ article: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    console.error("Generate error:", error);

    await prisma.generationLog.create({
      data: {
        prompt: "generation attempt",
        model: "gemini-2.0-flash",
        success: false,
        error: message,
      },
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
