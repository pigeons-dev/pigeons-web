"use client";

import Link from "next/link";
import { FadeIn } from "../ui/fade-in";

export function BottomCta() {
  return (
    <section className="bg-dark py-24 px-6">
      <div className="mx-auto max-w-3xl text-center">
        <FadeIn>
          <h2 className="display text-3xl sm:text-4xl text-white">
            Start sending in two minutes
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Free, open source, self-hosted. No API keys to buy, no usage limits,
            no vendor lock-in.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/docs/quick-start/"
              className="inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-accent/90 cursor-pointer"
            >
              Read the docs
            </Link>
            <a
              href="https://github.com/pigeons-dev/pigeons"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-white/20 px-5 py-2.5 text-base font-medium text-white/80 transition-colors hover:text-white hover:border-white/40 cursor-pointer"
            >
              Star on GitHub
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
