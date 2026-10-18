"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docSections } from "@/lib/doc-sections";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: vertical nav */}
      <nav className="sticky top-24 hidden lg:block" aria-label="Docs sidebar">
        <ul className="flex flex-col gap-0.5">
          {docSections.map((section) => {
            const href = `/docs/${section.slug}/`;
            const isActive = pathname === href || pathname === `/docs/${section.slug}`;

            return (
              <li key={section.slug}>
                <Link
                  href={href}
                  className={`block rounded-md border-l-2 py-1.5 pl-3 text-sm transition-colors ${
                    isActive
                      ? "border-accent bg-accent/5 font-medium text-accent"
                      : "border-transparent text-ink-2 hover:border-line hover:text-ink"
                  }`}
                >
                  {section.title}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 border-t border-line pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-2">
            LLM Resources
          </p>
          <ul className="flex flex-col gap-1.5">
            <li>
              <a
                href="/llms.txt"
                className="text-xs text-ink-2 transition-colors hover:text-accent-2"
              >
                llms.txt
              </a>
            </li>
            <li>
              <a
                href="/llms-full.txt"
                className="text-xs text-ink-2 transition-colors hover:text-accent-2"
              >
                llms-full.txt
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile: horizontal pills */}
      <nav className="lg:hidden" aria-label="Docs navigation">
        <div className="-mx-6 overflow-x-auto px-6">
          <ul className="flex gap-2 pb-2">
            {docSections.map((section) => {
              const href = `/docs/${section.slug}/`;
              const isActive = pathname === href || pathname === `/docs/${section.slug}`;

              return (
                <li key={section.slug} className="shrink-0">
                  <Link
                    href={href}
                    className={`inline-block rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-line text-ink-2 hover:border-line-2 hover:text-ink"
                    }`}
                  >
                    {section.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
