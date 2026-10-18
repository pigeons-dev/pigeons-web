import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { MarketingNav } from "@/components/marketing-nav";
import { Footer } from "@/components/footer";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pigeons.dev"),
  title: {
    default: "Pigeons  - open source email infrastructure for developers and AI agents",
    template: "%s | Pigeons",
  },
  description:
    "Open source email infrastructure for developers and AI agents. Send transactional email, receive inbound mail, and give your agents an inbox  - all self-hosted.",
  openGraph: {
    title: "Pigeons  - open source email infrastructure for developers and AI agents",
    description:
      "Send transactional email, receive inbound mail, and give your agents an inbox  - all self-hosted.",
    url: "https://pigeons.dev",
    siteName: "Pigeons",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pigeons  - open source email infrastructure for developers and AI agents",
    description:
      "Send transactional email, receive inbound mail, and give your agents an inbox  - all self-hosted.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Pigeons",
  url: "https://pigeons.dev",
  logo: "https://pigeons.dev/logo.png",
  sameAs: ["https://github.com/pigeons-dev"],
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Pigeons",
  url: "https://pigeons.dev",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Open source email infrastructure for developers and AI agents.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareJsonLd),
          }}
        />
        {plausibleDomain && (
          <script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body className="bg-page text-ink font-sans antialiased">
        <MarketingNav />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
