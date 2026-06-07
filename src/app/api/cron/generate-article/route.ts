import { NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/auth";
import { generateAndSaveArticle } from "@/lib/generate-article";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  if (!(await verifyCronSecret(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const article = await generateAndSaveArticle({ publish: true });
    return NextResponse.json({
      success: true,
      message: "Daily article generated and published",
      article: { id: article.id, title: article.title, slug: article.slug },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    console.error("Cron generate error:", error);

    await prisma.generationLog.create({
      data: {
        prompt: "cron daily generate",
        model: "gemini-2.5-flash",
        success: false,
        error: message,
      },
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
