import fs from "node:fs";
import path from "node:path";

export { docSections } from "./doc-sections";
export type { DocSection } from "./doc-sections";

const contentDir = path.join(process.cwd(), "src", "content", "docs");

export function getDocContent(slug: string): string | null {
  const filePath = path.join(contentDir, `${slug}.md`);
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

export interface DocHeading {
  depth: number;
  text: string;
  id: string;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getDocHeadings(content: string): DocHeading[] {
  const headings: DocHeading[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const depth = match[1].length;
      const text = match[2].trim();
      headings.push({ depth, text, id: slugifyHeading(text) });
    }
  }

  return headings;
}
