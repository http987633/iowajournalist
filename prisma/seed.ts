import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const topics = [
    "How to file a public records request in Iowa",
    "Iowa journalist career paths and salary guide",
    "Understanding Iowa's reporter shield privilege",
    "Best practices for covering Iowa state legislature",
    "Local news sustainability in rural Iowa communities",
    "Investigative journalism resources for Iowa reporters",
    "How to build sources in small-town Iowa",
    "Covering Iowa caucuses as a local journalist",
    "Ethics guide for Iowa newsrooms",
    "Student journalism opportunities in Iowa universities",
  ];

  await prisma.topicQueue.createMany({
    data: topics.map((keyword) => ({ keyword })),
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
