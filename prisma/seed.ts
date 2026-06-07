import { PrismaClient } from "@prisma/client";
import { TOPIC_POOL } from "../src/lib/topic-pool";

const prisma = new PrismaClient();

async function main() {
  await prisma.topicQueue.createMany({
    data: TOPIC_POOL.map((keyword) => ({ keyword })),
    skipDuplicates: true,
  });

  const existing = await prisma.article.findFirst({
    where: { slug: "welcome-to-iowa-journalist" },
  });

  if (!existing) {
    await prisma.article.create({
      data: {
        title: "Welcome to Iowa Journalist — Resources for Iowa Reporters",
        slug: "welcome-to-iowa-journalist",
        excerpt:
          "Your starting point for Iowa journalism resources, guides, and career insights.",
        content: `## Supporting Journalism in Iowa

Iowa has a rich tradition of local journalism — from community weeklies across the state's 99 counties to broadcast newsrooms in Des Moines, Cedar Rapids, and the Quad Cities.

**Iowa Journalist** exists to support the professionals who keep Iowa informed.

## What You'll Find Here

- **Guides** on public records access, court reporting, and state government coverage
- **Career resources** for aspiring and working journalists
- **Commentary** on Iowa's evolving local news ecosystem

## Get Started

Browse our [Resources](/resources) page for essential Iowa journalism organizations, or explore the latest [Articles](/articles).

## Our Commitment

We believe strong communities depend on strong local news. This platform is dedicated to practical, accurate resources for Iowa journalists.`,
        status: "PUBLISHED",
        source: "MANUAL",
        category: "Announcements",
        tags: "iowa,journalism,welcome",
        metaTitle: "Welcome to Iowa Journalist",
        metaDesc:
          "Resources, guides, and insights for journalists working in Iowa.",
        publishedAt: new Date(),
      },
    });
  }

  console.log("Seed completed.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
