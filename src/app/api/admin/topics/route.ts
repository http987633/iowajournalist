import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const topics = await prisma.topicQueue.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(topics);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.bulk) {
      const lines = (body.bulk as string)
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const created = await prisma.topicQueue.createMany({
        data: lines.map((keyword) => ({ keyword })),
      });
      return NextResponse.json({ count: created.count });
    }

    const topic = await prisma.topicQueue.create({
      data: {
        keyword: body.keyword,
        category: body.category || null,
      },
    });
    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error("Create topic error:", error);
    return NextResponse.json({ error: "Failed to create topic" }, { status: 500 });
  }
}
