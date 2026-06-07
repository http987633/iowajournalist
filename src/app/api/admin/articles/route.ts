import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseTags, tagsToString, toSlug } from "@/lib/slug";
import type { ArticleStatus } from "@prisma/client";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = body.title as string;
    const slug = (body.slug as string) || toSlug(title);
    const status = (body.status as ArticleStatus) || "DRAFT";
    const publishedAt =
      status === "PUBLISHED"
        ? body.publishedAt
          ? new Date(body.publishedAt)
          : new Date()
        : body.publishedAt
          ? new Date(body.publishedAt)
          : null;

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt: body.excerpt || null,
        content: body.content || "",
        status,
        source: body.source || "MANUAL",
        category: body.category || null,
        tags: tagsToString(parseTags(body.tags)),
        metaTitle: body.metaTitle || null,
        metaDesc: body.metaDesc || null,
        outboundUrl: body.outboundUrl || null,
        publishedAt,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Create article error:", error);
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}
