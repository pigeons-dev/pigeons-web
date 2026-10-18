# Pigeons Web

Landing page and documentation for [Pigeons](https://github.com/pigeons-dev/pigeons) - open source, self-hosted email infrastructure for developers and AI agents.

Live at [pigeons.dev](https://pigeons.dev).

## Stack

- [Next.js](https://nextjs.org) 16 (App Router, static export)
- [Tailwind CSS](https://tailwindcss.com) 4
- [Framer Motion](https://www.framer.com/motion/) for animations
- [react-markdown](https://github.com/remarkjs/react-markdown) for docs rendering

## Development

```bash
pnpm install
pnpm dev
```

Runs on [http://localhost:3000](http://localhost:3000).

## Structure

```
src/
  app/
    page.tsx              Landing page
    docs/                 Documentation pages
      layout.tsx          Docs sidebar layout
      page.tsx            Docs index
      [slug]/page.tsx     Individual doc pages
  components/
    home/                 Landing page sections (hero, features, examples, etc.)
    docs/                 Docs components (sidebar, content renderer)
    marketing-nav.tsx     Top navigation
    footer.tsx            Site footer
    pigeon-mark.tsx       Logo component
public/
  docs/                   Markdown doc files (quick-start, self-hosting, api-reference, etc.)
  llms.txt                LLM-friendly summary
  llms-full.txt           Full LLM context
  logo.png                Pigeon logo
```

## Docs

Documentation lives as markdown files in `public/docs/`. The `scripts/build-docs-mirrors.mjs` prebuild script generates mirror files for the docs pages. Adding a new doc page:

1. Create `public/docs/your-topic.md`.
2. Add the route to the sidebar in `src/components/docs/`.
3. Run `pnpm dev` - the prebuild script picks it up automatically.

## Build

```bash
pnpm build
```

Outputs a static export to `out/` for deployment.

## License

MIT
