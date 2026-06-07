import { NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/auth";

export async function GET(request: Request) {
  if (!(await verifyCronSecret(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.url.split("/api")[0];
  const res = await fetch(`${siteUrl}/api/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CRON_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
