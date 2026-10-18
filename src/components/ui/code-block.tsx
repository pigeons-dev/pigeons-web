"use client";

import { useRef, useState } from "react";

export function CodeBlock({ children }: { children: React.ReactNode }) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = preRef.current?.textContent ?? "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative mb-6 overflow-hidden rounded-xl border border-dark-3 bg-dark">
      <button
        onClick={handleCopy}
        className="absolute right-3 top-3 z-10 rounded px-2 py-1 font-mono text-xs text-white/40 transition-all hover:text-white/70 opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        {copied ? "copied" : "copy"}
      </button>
      <pre
        ref={preRef}
        className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-white"
      >
        {children}
      </pre>
    </div>
  );
}
