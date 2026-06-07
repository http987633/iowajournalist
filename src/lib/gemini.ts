import { GoogleGenerativeAI } from "@google/generative-ai";
import { toSlug } from "./slug";

export interface GeneratedArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDesc: string;
  tags: string[];
  category: string;
}

export async function generateArticleWithGemini(
  keyword: string,
  category?: string
): Promise<{ article: GeneratedArticle; model: string; prompt: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const modelName = "gemini-2.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = `You are an expert Iowa journalism writer and SEO content strategist.

Write an original, informative article about: "${keyword}"
${category ? `Category: ${category}` : ""}

Requirements:
- 1200-1800 words in Markdown format
- Professional, factual tone suitable for iowajournalist.org
- Include Iowa-specific journalism context where relevant
- Use H2 and H3 headings
- Include a short introduction and conclusion
- Do NOT fabricate quotes, statistics, or named sources
- Add a "References" section with 2-3 real, verifiable resource types (e.g. Iowa FOI Council, University of Iowa journalism program) as plain text links or mentions — no fake URLs

Return ONLY valid JSON with this exact structure:
{
  "title": "Article title (60 chars max)",
  "excerpt": "2-3 sentence summary",
  "content": "Full article in Markdown",
  "metaTitle": "SEO title (60 chars max)",
  "metaDesc": "SEO meta description (155 chars max)",
  "tags": ["tag1", "tag2", "tag3"],
  "category": "category name"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = JSON.parse(text) as Omit<GeneratedArticle, "slug"> & {
    slug?: string;
  };

  const slug = parsed.slug || toSlug(parsed.title);

  return {
    article: {
      title: parsed.title,
      slug,
      excerpt: parsed.excerpt,
      content: parsed.content,
      metaTitle: parsed.metaTitle,
      metaDesc: parsed.metaDesc,
      tags: parsed.tags || [],
      category: parsed.category || category || "General",
    },
    model: modelName,
    prompt,
  };
}
