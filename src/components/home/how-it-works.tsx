"use client";

import { useState } from "react";
import { FadeIn, Stagger, StaggerItem } from "../ui/fade-in";

const steps = [
  {
    number: "1",
    title: "Deploy",
    description:
      "docker run or deploy to your cloud. One container, one SQLite file, zero dependencies.",
    code: "docker run -d -p 3891:3891 ghcr.io/pigeons-dev/pigeons",
  },
  {
    number: "2",
    title: "Connect AWS SES",
    description:
      "Run pigeons setup aws to configure SES, DNS records, and event tracking.",
    code: "pigeons setup aws",
  },
  {
    number: "3",
    title: "Send Email",
    description:
      "Use the SDK, CLI, REST API, or MCP server. Emails queue, retry, and track automatically.",
    code: 'pigeons send --to user@example.com --subject "Hello"',
  },
];

function CopyBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="group mt-4 flex w-full items-center gap-3 rounded-md border border-dark-3 bg-dark px-5 py-3 text-left font-mono text-sm text-white transition-all hover:bg-dark-3 cursor-pointer"
    >
      <span className="text-ink-3 select-none">$</span>
      <span className="break-all">{code}</span>
      <span className="ml-auto shrink-0 text-xs text-ink-3 transition-colors group-hover:text-white select-none">
        {copied ? "copied" : "copy"}
      </span>
    </button>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-surface-alt">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <p className="eyebrow mb-3 text-center">How It Works</p>
          <h2 className="display text-center text-3xl sm:text-4xl text-ink">
            Up and running in three steps
          </h2>
        </FadeIn>

        <Stagger stagger={0.06} className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map((s) => (
            <StaggerItem key={s.number}>
              <div className="relative">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                  {s.number}
                </div>

                <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-ink-2">
                  {s.description}
                </p>

                <CopyBlock code={s.code} />
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
