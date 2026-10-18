import { ArrowRight } from "lucide-react";

const examplesUrl =
  "https://github.com/pigeons-dev/pigeons/tree/main/examples";

const categories = [
  "Quick Starts",
  "Transactional",
  "Inbound",
  "AI / MCP",
  "Marketing",
  "Full-Stack",
];

export function Examples() {
  return (
    <section id="examples" className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow mb-3 text-center">Examples</p>
        <h2 className="display text-center text-3xl sm:text-4xl text-ink">
          Ready to run examples
        </h2>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((title) => (
            <a
              key={title}
              href={examplesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-xl border border-line bg-surface-alt p-6 transition-colors hover:border-accent/40 cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-ink">{title}</h3>
              <ArrowRight className="h-4 w-4 text-ink-3 transition-colors group-hover:text-accent" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
