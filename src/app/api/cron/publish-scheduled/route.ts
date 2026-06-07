import { NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  if (!(await verifyCronSecret(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const result = await prisma.article.updateMany({
    where: {
      status: "SCHEDULED",
      publishedAt: { lte: now },
    },
    data: { status: "PUBLISHED" },
  });

  return NextResponse.json({ published: result.count });
}
