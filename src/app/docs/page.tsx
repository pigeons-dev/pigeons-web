import Link from "next/link";
import { docSections } from "@/lib/doc-sections";

export const metadata = {
  title: "Documentation",
  description:
    "Guides, API reference, and SDK docs for Pigeons email infrastructure.",
};

export default function DocsIndexPage() {
  return (
    <div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-ink mb-4">
        Documentation
      </h1>
      <p className="text-lg text-ink-2 mb-12 max-w-2xl leading-relaxed">
        Everything you need to send email, receive inbound mail, and give your
        AI agents an inbox. Pick a topic to get started.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {docSections.map((section) => (
          <Link
            key={section.slug}
            href={`/docs/${section.slug}/`}
            className="group rounded-xl border border-line bg-page p-5 transition-colors hover:border-accent hover:bg-surface-alt"
          >
            <h2 className="text-lg font-semibold text-ink mb-2 group-hover:text-accent">
              {section.title}
            </h2>
            <p className="text-base text-ink-2 leading-relaxed">
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
