import { readFileSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { generateArticleWithGemini } from "../src/lib/gemini";
import { tagsToString } from "../src/lib/slug";

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
    if (!process.env[key]) process.env[key] = value;
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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateWithRetry(keyword: string, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await generateArticleWithGemini(keyword);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const retryable =
        message.includes("503") ||
        message.includes("429") ||
        message.includes("high demand");
      if (!retryable || i === attempts - 1) throw error;
      await sleep(8000 * (i + 1));
    }
  }
  throw new Error("unreachable");
}

async function main() {
  loadEnv();
  const prisma = new PrismaClient();
  const target = Number(process.argv[2] || 25);

  const allArticles = await prisma.article.findMany({
    select: { id: true, title: true, slug: true, content: true, excerpt: true },
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
    console.log(
      `Deleted ${chineseArticles.length} Chinese article(s):`,
      chineseArticles.map((a) => a.title).join(" | ")
    );
  } else {
    console.log("No Chinese articles found to delete.");
  }

  const existingSlugs = new Set(
    (await prisma.article.findMany({ select: { slug: true } })).map((a) => a.slug)
  );

  let created = 0;
  for (const keyword of TOPICS.slice(0, target)) {
    try {
      console.log(`Generating (${created + 1}/${target}): ${keyword}`);
      const { article, model, prompt } = await generateWithRetry(keyword);

      let slug = article.slug;
      if (existingSlugs.has(slug)) slug = `${slug}-${Date.now()}`;
      existingSlugs.add(slug);

      const saved = await prisma.article.create({
        data: {
          title: article.title,
          slug,
          excerpt: article.excerpt,
          content: article.content,
          status: "PUBLISHED",
          source: "GEMINI_AUTO",
          category: article.category,
          tags: tagsToString(article.tags),
          metaTitle: article.metaTitle,
          metaDesc: article.metaDesc,
          publishedAt: new Date(),
        },
      });

      await prisma.generationLog.create({
        data: {
          articleId: saved.id,
          prompt,
          model,
          success: true,
        },
      });

      created++;
      console.log(`Published: ${saved.title}`);
      await sleep(5000);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed: ${keyword} — ${message}`);
      await prisma.generationLog.create({
        data: {
          prompt: keyword,
          model: "gemini-2.5-flash",
          success: false,
          error: message,
        },
      });
    }
  }

  console.log(`Done. Published ${created}/${target} articles.`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
