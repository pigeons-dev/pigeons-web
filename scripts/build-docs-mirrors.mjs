/**
 * Copies each markdown doc to public/docs/{slug}.md,
 * concatenates all into public/llms-full.txt,
 * and creates public/llms.txt with a brief index.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const contentDir = path.join(root, "src", "content", "docs");
const publicDir = path.join(root, "public");
const publicDocsDir = path.join(publicDir, "docs");

const sections = [
  { slug: "quick-start", title: "Quick Start" },
  { slug: "self-hosting", title: "Self-Hosting" },
  { slug: "api-reference", title: "API Reference" },
  { slug: "typescript-sdk", title: "TypeScript SDK" },
  { slug: "python-sdk", title: "Python SDK" },
  { slug: "cli", title: "CLI" },
  { slug: "mcp", title: "MCP Server" },
  { slug: "domains", title: "Domains & DNS" },
  { slug: "contacts", title: "Contacts" },
  { slug: "templates", title: "Templates" },
  { slug: "inboxes", title: "Inboxes" },
  { slug: "campaigns", title: "Campaigns & Sequences" },
  { slug: "webhooks", title: "Webhooks" },
  { slug: "open-tracking", title: "Open Tracking" },
];

// Ensure output dirs exist
fs.mkdirSync(publicDocsDir, { recursive: true });

const fullParts = [];
const indexLines = [
  "# Pigeons — llms.txt",
  "",
  "> Open-source email infrastructure for developers and AI agents.",
  "> https://pigeons.dev",
  "",
  "## Documentation",
  "",
];

let found = 0;

for (const section of sections) {
  const src = path.join(contentDir, `${section.slug}.md`);
  const dest = path.join(publicDocsDir, `${section.slug}.md`);

  if (fs.existsSync(src)) {
    const content = fs.readFileSync(src, "utf-8");
    fs.writeFileSync(dest, content);

    fullParts.push(
      `${"=".repeat(60)}`,
      `${section.title} (${section.slug})`,
      `${"=".repeat(60)}`,
      "",
      content.trim(),
      "",
      "",
    );

    indexLines.push(
      `- [${section.title}](https://pigeons.dev/docs/${section.slug}/)`,
    );

    found++;
  } else {
    indexLines.push(
      `- [${section.title}](https://pigeons.dev/docs/${section.slug}/) — coming soon`,
    );
  }
}

indexLines.push(
  "",
  "## Full docs",
  "",
  "- [llms-full.txt](https://pigeons.dev/llms-full.txt) — all docs concatenated",
  "",
  "## Source",
  "",
  "- [GitHub](https://github.com/pigeons-dev/pigeons)",
  "- [npm](https://www.npmjs.com/package/@pigeons/pigeons-ts)",
  "- [PyPI](https://pypi.org/project/pigeons-py)",
  "",
);

fs.writeFileSync(path.join(publicDir, "llms.txt"), indexLines.join("\n"));

if (fullParts.length > 0) {
  const header = [
    "# Pigeons — complete documentation",
    "",
    "> Open-source email infrastructure for developers and AI agents.",
    "> https://pigeons.dev",
    "",
    "",
  ].join("\n");

  fs.writeFileSync(
    path.join(publicDir, "llms-full.txt"),
    header + fullParts.join("\n"),
  );
} else {
  fs.writeFileSync(
    path.join(publicDir, "llms-full.txt"),
    "# Pigeons — complete documentation\n\nNo docs content yet.\n",
  );
}

console.log(
  `[build-docs-mirrors] Processed ${sections.length} sections (${found} with content).`,
);
