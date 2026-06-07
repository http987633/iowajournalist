import slugifyLib from "slugify";

export function toSlug(text: string): string {
  return slugifyLib(text, { lower: true, strict: true, trim: true });
}

export function parseTags(tags: string | string[] | undefined): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(Boolean);
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function tagsToString(tags: string[]): string {
  return tags.join(",");
}
