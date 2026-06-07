import { NextResponse } from "next/server";
import { isAdminAuthenticated, verifyCronSecret } from "@/lib/auth";
import { generateAndSaveArticle } from "@/lib/generate-article";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const isCron = await verifyCronSecret(request);
  const isAdmin = await isAdminAuthenticated();

  if (!isCron && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const autoPublishEnv = process.env.AUTO_PUBLISH_GEMINI === "true";
    const publish = isCron || autoPublishEnv;

    const saved = await generateAndSaveArticle({
      keyword: body.keyword as string | undefined,
      category: body.category as string | undefined,
      publish,
    });

    return NextResponse.json({ article: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    console.error("Generate error:", error);

    await prisma.generationLog.create({
      data: {
        prompt: "generation attempt",
        model: "gemini-2.5-flash",
        success: false,
        error: message,
      },
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
