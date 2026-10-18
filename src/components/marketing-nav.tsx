"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { PigeonMark } from "./pigeon-mark";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Docs", href: "/docs/" },
  { label: "Examples", href: "/#examples" },
  { label: "GitHub", href: "https://github.com/pigeons-dev/pigeons" },
];

export function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-page/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-3xl font-bold text-ink">
          <PigeonMark size={34} className="translate-y-0.5" />
          Pigeons
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-base text-ink-2 transition-colors hover:text-ink"
                {...(link.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <Link
          href="/docs/quick-start/"
          className="hidden rounded-lg bg-accent px-4 py-2 text-base font-medium text-white transition-opacity hover:opacity-90 md:inline-flex cursor-pointer"
        >
          Get Started
        </Link>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex items-center justify-center rounded-md p-2 text-ink-2 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
    </header>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="border-t border-line bg-page px-6 pb-6 pt-4 md:hidden">
      <ul className="flex flex-col gap-4">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onClose}
              className="block text-sm text-ink-2 transition-colors hover:text-ink"
              {...(link.href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/docs/quick-start/"
        onClick={onClose}
        className="mt-4 block rounded-lg bg-accent px-4 py-2 text-center text-base font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
      >
        Get Started
      </Link>
    </div>
  );
}
