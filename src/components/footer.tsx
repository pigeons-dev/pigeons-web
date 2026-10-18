import Link from "next/link";
import { PigeonMark } from "./pigeon-mark";

const groups = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Examples", href: "/#examples" },
    ],
  },
  {
    title: "Docs",
    links: [
      { label: "Quick Start", href: "/docs/quick-start/" },
      { label: "API Reference", href: "/docs/api-reference/" },
      { label: "TypeScript SDK", href: "/docs/typescript-sdk/" },
      { label: "Python SDK", href: "/docs/python-sdk/" },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/pigeons-dev/pigeons",
      },
      {
        label: "npm",
        href: "https://www.npmjs.com/package/@pigeons/pigeons-ts",
      },
      {
        label: "PyPI",
        href: "https://pypi.org/project/pigeons-py",
      },
      { label: "llms.txt", href: "/llms.txt" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface-alt">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand column */}
          <div className="md:col-span-1">
            <span className="flex items-center gap-2 text-3xl font-bold text-ink">
              <PigeonMark size={34} className="translate-y-0.5" />
              Pigeons
            </span>
            <p className="mt-3 text-base leading-relaxed text-ink-2">
              Open source email infrastructure for developers and AI agents.
            </p>
          </div>

          {/* Link groups */}
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-base font-semibold text-ink">{group.title}</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {group.links.map((link) => {
                  const isExternal = link.href.startsWith("http");
                  const isStatic = /\.\w+$/.test(link.href);
                  const Tag = isExternal || isStatic ? "a" : Link;
                  return (
                    <li key={link.href}>
                      <Tag
                        href={link.href}
                        className="text-base text-ink-2 transition-colors hover:text-ink"
                        {...(isExternal
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {link.label}
                      </Tag>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-line pt-6">
          <p className="text-sm text-ink-2 text-center">
            &copy; {new Date().getFullYear()} Pigeons. Open source under the
            Apache 2.0 license.
          </p>
        </div>
      </div>
    </footer>
  );
}
