export interface DocSection {
  slug: string;
  title: string;
  description: string;
}

export const docSections: DocSection[] = [
  {
    slug: "quick-start",
    title: "Quick Start",
    description: "Run Pigeons, send your first email, and install an SDK.",
  },
  {
    slug: "self-hosting",
    title: "Self-Hosting",
    description:
      "Deploy with Docker, configure AWS SES, and go to production.",
  },
  {
    slug: "domains",
    title: "Domains & DNS",
    description: "Add a sending domain, configure DNS records, and verify.",
  },
  {
    slug: "templates",
    title: "Templates",
    description:
      "Create reusable email templates with variable substitution.",
  },
  {
    slug: "contacts",
    title: "Contacts",
    description: "Create, tag, and segment your audience.",
  },
  {
    slug: "campaigns",
    title: "Campaigns & Sequences",
    description:
      "Send one-time campaigns and multi-step drip sequences.",
  },
  {
    slug: "inboxes",
    title: "Inboxes",
    description: "Receive inbound email via webhooks and threading.",
  },
  {
    slug: "webhooks",
    title: "Webhooks",
    description:
      "Subscribe to delivery, bounce, complaint, and inbound events.",
  },
  {
    slug: "open-tracking",
    title: "Open Tracking",
    description: "Opt-in pixel tracking for email opens.",
  },
  {
    slug: "typescript-sdk",
    title: "TypeScript SDK",
    description: "Install, configure, and use @pigeons/pigeons-ts.",
  },
  {
    slug: "python-sdk",
    title: "Python SDK",
    description: "Install, configure, and use pigeons-py.",
  },
  {
    slug: "cli",
    title: "CLI",
    description: "Manage your Pigeons instance from the command line.",
  },
  {
    slug: "mcp",
    title: "MCP Server",
    description:
      "Tools for LLM agents to send email, manage inboxes, and run campaigns.",
  },
  {
    slug: "api-reference",
    title: "API Reference",
    description: "Every endpoint, parameter, and response shape.",
  },
];
