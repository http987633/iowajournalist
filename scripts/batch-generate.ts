import { readFileSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.production.local");
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value && !process.env[key]) process.env[key] = value;
  }
}

const CJK_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;

const TOPICS = [
  "How to file a public records request in Iowa",
  "Iowa journalist career paths and salary guide",
  "Understanding Iowa reporter shield privilege in court",
  "Best practices for covering Iowa state legislature sessions",
  "Local news sustainability in rural Iowa communities",
  "Investigative journalism resources for Iowa reporters",
  "How to build reliable sources in small-town Iowa",
  "Covering Iowa caucuses as a local journalist",
  "Ethics guide for Iowa newsrooms and freelancers",
  "Student journalism opportunities at Iowa universities",
  "How Iowa Freedom of Information Council helps reporters",
  "Covering Iowa agriculture and farm policy for local media",
  "Tips for Iowa broadcast journalists covering breaking news",
  "How to pitch investigative stories to Iowa editors",
  "Open meetings law basics for Iowa journalists",
  "Building a freelance journalism career in Des Moines",
  "Covering Iowa school boards and education policy",
  "Digital tools Iowa journalists should know in 2026",
  "How to verify sources and fight misinformation in Iowa",
  "Covering Iowa courts and criminal justice as a reporter",
  "Networking for journalists at Iowa media associations",
  "Writing compelling local feature stories in Iowa",
  "How Iowa nonprofit newsrooms are filling coverage gaps",
  "Safety tips for Iowa reporters at public protests",
  "Creating a portfolio for Iowa journalism job applications",
];

const SITE_URL = "https://iowajournalist.org";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateViaProduction(keyword: string, cronSecret: string) {
  for (let i = 0; i < 5; i++) {
    const res = await fetch(`${SITE_URL}/api/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keyword }),
    });
    const data = await res.json();
    if (res.ok) return data.article as { id: string; title: string; slug: string };
    const err = (data as { error?: string }).error || "Unknown error";
    if (err.includes("503") || err.includes("429") || err.includes("high demand")) {
      await sleep(10000 * (i + 1));
      continue;
    }
    throw new Error(err);
  }
  throw new Error("Max retries exceeded");
}

async function main() {
  loadEnv();
  const prisma = new PrismaClient();
  const cronSecret = process.env.CRON_SECRET;
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  if (!cronSecret) throw new Error("CRON_SECRET missing");

  const target = Number(process.argv[2] || 25);

  const allArticles = await prisma.article.findMany({
    select: { id: true, title: true, content: true, excerpt: true },
  });

  const chineseArticles = allArticles.filter(
    (a) =>
      CJK_REGEX.test(a.title) ||
      CJK_REGEX.test(a.content) ||
      CJK_REGEX.test(a.excerpt || "")
  );

  if (chineseArticles.length > 0) {
    await prisma.article.deleteMany({
      where: { id: { in: chineseArticles.map((a) => a.id) } },
    });
    console.log(`Deleted ${chineseArticles.length} Chinese article(s).`);
  }

  const publishedCount = await prisma.article.count({
    where: { status: "PUBLISHED", slug: { not: "welcome-to-iowa-journalist" } },
  });
  const needed = Math.max(0, target - publishedCount);
  console.log(`Already have ${publishedCount} AI articles. Generating ${needed} more...`);

  let created = 0;
  for (const keyword of TOPICS) {
    if (created >= needed) break;

    const exists = await prisma.article.findFirst({
      where: {
        OR: [
          { title: { contains: keyword.slice(0, 40), mode: "insensitive" } },
          { content: { contains: keyword.slice(0, 30), mode: "insensitive" } },
        ],
        status: "PUBLISHED",
      },
    });
    if (exists) {
      console.log(`Skip (exists): ${keyword}`);
      continue;
    }

    try {
      console.log(`Generating (${created + 1}/${needed}): ${keyword}`);
      const draft = await generateViaProduction(keyword, cronSecret);

      const published = await prisma.article.update({
        where: { id: draft.id },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });

      created++;
      console.log(`Published: ${published.title}`);
      await sleep(8000);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed: ${keyword} — ${message}`);
    }
  }

  const total = await prisma.article.count({ where: { status: "PUBLISHED" } });
  console.log(`Done. Published ${created} new articles. Total published: ${total}`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
