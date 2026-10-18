import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Pigeons - open source email infrastructure for developers and AI agents";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0A",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 40,
          }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 64 64"
          >
            <rect width="64" height="64" rx="14" fill="#656ee8" />
            <g transform="translate(32 32) scale(0.78) translate(-32 -32)">
              <path
                d="M 50 24 L 57 27 L 50 30 C 48 36, 44 42, 38 46 C 32 50, 24 48, 18 44 C 12 40, 8 34, 8 28 L 2 20 L 10 26 C 12 18, 18 12, 26 10 C 34 8, 42 12, 46 18 C 48 20, 50 22, 50 24 Z"
                fill="#FFFFFF"
              />
              <circle cx="44" cy="20" r="2.5" fill="#656ee8" />
              <circle cx="44.5" cy="19.5" r="1.2" fill="#FFFFFF" />
            </g>
          </svg>
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#FFFFFF",
            }}
          >
            Pigeons
          </span>
        </div>
        <span
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: "#FFFFFF",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          email for your AI agents
        </span>
        <span
          style={{
            fontSize: 20,
            color: "#A3A3A3",
            marginTop: 16,
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          open source email infrastructure. self-hosted in one Docker container.
        </span>
      </div>
    ),
    { ...size }
  );
}
