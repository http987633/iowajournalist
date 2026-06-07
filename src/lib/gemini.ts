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

function parseGeminiArticleJson(raw: string) {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const title = cleaned.match(/"title"\s*:\s*"((?:\\.|[^"\\])*)"/)?.[1];
    const excerpt = cleaned.match(/"excerpt"\s*:\s*"((?:\\.|[^"\\])*)"/)?.[1];
    const metaTitle = cleaned.match(/"metaTitle"\s*:\s*"((?:\\.|[^"\\])*)"/)?.[1];
    const metaDesc = cleaned.match(/"metaDesc"\s*:\s*"((?:\\.|[^"\\])*)"/)?.[1];
    const category = cleaned.match(/"category"\s*:\s*"((?:\\.|[^"\\])*)"/)?.[1];
    const contentMatch = cleaned.match(/"content"\s*:\s*"([\s\S]*)"\s*,\s*"metaTitle"/);
    const tagsMatch = cleaned.match(/"tags"\s*:\s*(\[[^\]]*\])/);

    if (!title || !contentMatch) {
      throw new Error("Failed to parse Gemini JSON response");
    }

    const unescape = (s: string) =>
      s.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");

    return {
      title: unescape(title),
      excerpt: excerpt ? unescape(excerpt) : "",
      content: unescape(contentMatch[1]),
      metaTitle: metaTitle ? unescape(metaTitle) : title,
      metaDesc: metaDesc ? unescape(metaDesc) : "",
      tags: tagsMatch ? JSON.parse(tagsMatch[1]) : [],
      category: category ? unescape(category) : "General",
    };
  }
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
- 700-1000 words in Markdown format
- Professional, factual tone suitable for iowajournalist.org
- Include Iowa-specific journalism context where relevant
- Use H2 and H3 headings
- Include a short introduction and conclusion
- Do NOT fabricate quotes, statistics, or named sources
- Add a "References" section with 2-3 real resource mentions (no fake URLs)
- IMPORTANT: Return strictly valid JSON. Escape all newlines in strings as \\n and escape quotes as \\"

Return ONLY valid JSON with this exact structure:
{
  "title": "Article title (60 chars max)",
  "excerpt": "2-3 sentence summary",
  "content": "Full article in Markdown with escaped newlines",
  "metaTitle": "SEO title (60 chars max)",
  "metaDesc": "SEO meta description (155 chars max)",
  "tags": ["tag1", "tag2", "tag3"],
  "category": "category name"
}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  const parsed = parseGeminiArticleJson(raw) as Omit<GeneratedArticle, "slug"> & {
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
