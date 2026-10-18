"use client";

import { Mail, Inbox, Megaphone, Bot, Code, Server } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FadeIn, Stagger, StaggerItem } from "../ui/fade-in";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Mail,
    title: "Transactional Email",
    description:
      "Send via SES with queuing, retries, and delivery tracking. Every email is logged with full event history.",
  },
  {
    icon: Inbox,
    title: "Inbound Webhooks",
    description:
      "Receive email via SES receipt rules, parsed and delivered to your app as structured webhook payloads.",
  },
  {
    icon: Megaphone,
    title: "Campaigns & Sequences",
    description:
      "One-time sends and multi-step drip sequences with audience segmentation and per-step analytics.",
  },
  {
    icon: Bot,
    title: "MCP Server",
    description:
      "14 tools for AI agents to send email, manage contacts, and run campaigns through the Model Context Protocol.",
  },
  {
    icon: Code,
    title: "TypeScript & Python SDKs",
    description:
      "Typed clients for both languages, plus a CLI and curl-friendly REST API. First-class developer experience.",
  },
  {
    icon: Server,
    title: "Self-Hosted",
    description:
      "Your data, your infrastructure. One Docker container, SQLite or LibSQL. No usage limits, no vendor lock-in.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="eyebrow mb-3 text-center">Features</p>
          <h2 className="display text-center text-3xl sm:text-4xl text-ink">
            Everything you need to send email
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-ink-2 leading-relaxed">
            A complete email platform in a single binary. Transactional, inbound,
            campaigns, and AI tooling out of the box.
          </p>
        </FadeIn>

        <Stagger stagger={0.04} className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <div className="rounded-xl border border-line bg-surface-alt p-6 h-full">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <f.icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="text-[17px] font-semibold text-ink mb-3">{f.title}</h3>
                <p className="text-base text-ink-2 leading-[1.75]">
                  {f.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
