import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import {
  docSections,
  getDocContent,
  slugifyHeading,
} from "@/lib/docs";
import { CodeBlock } from "@/components/ui/code-block";

export function generateStaticParams() {
  return docSections.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = docSections.find((s) => s.slug === slug);
  if (!section) return {};
  return {
    title: section.title,
    description: section.description,
  };
}

const components: Components = {
  h1: ({ children }) => {
    const text = extractText(children);
    const id = slugifyHeading(text);
    return (
      <h1 id={id} className="mb-6 text-4xl font-extrabold tracking-tight text-ink">
        {children}
      </h1>
    );
  },
  h2: ({ children }) => {
    const text = extractText(children);
    const id = slugifyHeading(text);
    return (
      <h2
        id={id}
        className="mb-4 mt-12 text-2xl font-bold tracking-tight text-ink scroll-mt-24"
      >
        {children}
      </h2>
    );
  },
  h3: ({ children }) => {
    const text = extractText(children);
    const id = slugifyHeading(text);
    return (
      <h3
        id={id}
        className="mb-3 mt-8 text-lg font-semibold text-ink"
      >
        {children}
      </h3>
    );
  },
  p: ({ children }) => (
    <p className="mb-4 text-base leading-relaxed text-ink-2">{children}</p>
  ),
  a: ({ href, children }) => {
    const isExternal = href?.startsWith("http");
    const isStatic = href ? /\.\w+$/.test(href) : false;
    const props = {
      href: href ?? "#",
      className: "text-accent-2 underline decoration-accent-2/30 underline-offset-2 transition-colors hover:text-accent",
      ...(isExternal ? { target: "_blank" as const, rel: "noopener noreferrer" } : {}),
    };
    if (isExternal || isStatic) {
      return <a {...props}>{children}</a>;
    }
    return <Link {...props}>{children}</Link>;
  },
  ul: ({ children }) => (
    <ul className="mb-4 ml-6 list-disc space-y-2 text-base text-ink-2 leading-relaxed">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 ml-6 list-decimal space-y-2 text-base text-ink-2 leading-relaxed">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className={`${className ?? ""} text-[13px]`}>{children}</code>
      );
    }
    return (
      <code className="rounded bg-surface-alt border border-line px-1.5 py-0.5 font-mono text-[13px] text-ink">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  table: ({ children }) => (
    <div className="mb-6 overflow-x-auto">
      <table className="w-full text-left text-[15px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-line">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-sm font-semibold text-ink">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-line px-3 py-2 text-ink-2">
      {children}
    </td>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-2 border-accent pl-4 text-base text-ink-2 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-line" />,
};

function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return extractText((children as { props: { children: React.ReactNode } }).props.children);
  }
  return "";
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sectionIndex = docSections.findIndex((s) => s.slug === slug);
  if (sectionIndex === -1) notFound();

  const section = docSections[sectionIndex];
  const content = getDocContent(slug);

  const prev = sectionIndex > 0 ? docSections[sectionIndex - 1] : null;
  const next =
    sectionIndex < docSections.length - 1
      ? docSections[sectionIndex + 1]
      : null;

  return (
    <article>
      {content ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </ReactMarkdown>
      ) : (
        <div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-ink">
            {section.title}
          </h1>
          <p className="text-lg text-ink-2">{section.description}</p>
          <p className="mt-6 rounded-lg border border-line bg-surface-alt px-4 py-3 text-base text-ink-2">
            This page is coming soon. Check back or{" "}
            <Link
              href="https://github.com/pigeons-dev/pigeons"
              className="text-accent-2 underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              follow the repo
            </Link>{" "}
            for updates.
          </p>
        </div>
      )}

      {/* Prev / Next nav */}
      <nav className="mt-16 flex items-center justify-between border-t border-line pt-6">
        {prev ? (
          <Link
            href={`/docs/${prev.slug}/`}
            className="group text-sm text-ink-3 transition-colors hover:text-accent-2"
          >
            <span className="text-xs uppercase tracking-wider">Previous</span>
            <span className="mt-0.5 block font-medium text-ink-2 group-hover:text-accent-2">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/docs/${next.slug}/`}
            className="group text-right text-sm text-ink-3 transition-colors hover:text-accent-2"
          >
            <span className="text-xs uppercase tracking-wider">Next</span>
            <span className="mt-0.5 block font-medium text-ink-2 group-hover:text-accent-2">
              {next.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
