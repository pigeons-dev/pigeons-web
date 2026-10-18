"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PigeonField } from "./pigeon-field";

const INSTALL_CMD = "docker run -d -p 3891:3891 ghcr.io/pigeons-dev/pigeons";

function InstallCommand() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(INSTALL_CMD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="group flex items-center gap-3 px-5 py-3 bg-dark text-white rounded-md font-mono text-sm transition-all hover:bg-dark-3 cursor-pointer border border-dark-3"
    >
      <span className="text-ink-3 select-none">$</span>
      <span>{INSTALL_CMD}</span>
      <span className="text-xs text-ink-3 group-hover:text-white transition-colors select-none">
        {copied ? "copied" : "copy"}
      </span>
    </button>
  );
}

const sdkSnippet = `import { Pigeons } from '@pigeons/pigeons-ts'

const pigeons = new Pigeons({ baseUrl: 'http://localhost:3891' })

await pigeons.emails.send({
  to: 'user@example.com',
  subject: 'Hello from Pigeons',
  html: '<p>Your email is working!</p>',
})`;

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14">
      <div className="absolute inset-0 bg-page" />
      <PigeonField />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 45% 55% at center, rgb(255 255 255 / 0.5) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 pt-16 pb-32 flex flex-col items-center text-center pointer-events-none">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="eyebrow mb-4"
        >
          Open Source Email Infrastructure
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="text-5xl md:text-7xl font-extrabold text-ink tracking-tight max-w-4xl leading-[1.08]"
        >
          email for your AI agents
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-8 text-lg md:text-xl text-ink-2 max-w-2xl mx-auto leading-relaxed"
        >
          give your agents their own email address. send transactional
          email, receive inbound mail into agent inboxes, run campaigns, and
          manage contacts. self-hosted in one Docker container.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-3 pointer-events-auto"
        >
          <InstallCommand />
          <a
            href="/docs/"
            className="px-8 py-3 border border-line-2 text-ink-2 font-semibold rounded-md no-underline transition-all hover:bg-surface-alt hover:border-ink-3 hover:text-ink cursor-pointer"
          >
            read the docs
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
          {[
            "send via AWS SES",
            "inbound email",
            "campaigns & sequences",
            "mcp server",
            "typescript & python sdks",
          ].map((pill) => (
            <span
              key={pill}
              className="px-3 py-1 rounded-full border border-line bg-surface/80 text-ink-2 font-mono text-xs"
            >
              {pill}
            </span>
          ))}
        </motion.div>

        {/* Terminal mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-14 w-full max-w-2xl mx-auto pointer-events-auto"
        >
          <div
            className="rounded-xl bg-dark overflow-hidden text-left border border-dark-3"
            style={{ boxShadow: "0 20px 60px -20px rgba(0, 0, 0, 0.3)" }}
          >
            <div className="flex items-center gap-2 border-b border-dark-3 px-5 py-3.5 bg-dark-2">
              <span className="h-2.5 w-2.5 rounded-full bg-dark-3" />
              <span className="h-2.5 w-2.5 rounded-full bg-dark-3" />
              <span className="h-2.5 w-2.5 rounded-full bg-dark-3" />
              <span className="ml-3 font-mono text-xs text-ink-3">
                terminal
              </span>
            </div>
            <div className="p-5 font-mono text-[13px] leading-relaxed">
              <pre className="text-white whitespace-pre-wrap">{sdkSnippet}</pre>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
