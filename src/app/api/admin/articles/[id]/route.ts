import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseTags, tagsToString, toSlug } from "@/lib/slug";
import type { ArticleStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(article);
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const status = body.status as ArticleStatus | undefined;

    let publishedAt: Date | null | undefined = undefined;
    if (body.publishedAt !== undefined) {
      publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
    } else if (status === "PUBLISHED") {
      const existing = await prisma.article.findUnique({ where: { id } });
      publishedAt = existing?.publishedAt || new Date();
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug || (body.title ? toSlug(body.title) : undefined),
        excerpt: body.excerpt,
        content: body.content,
        status,
        category: body.category,
        tags: body.tags !== undefined ? tagsToString(parseTags(body.tags)) : undefined,
        metaTitle: body.metaTitle,
        metaDesc: body.metaDesc,
        outboundUrl: body.outboundUrl,
        publishedAt,
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("Update article error:", error);
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
