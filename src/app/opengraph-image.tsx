import { ImageResponse } from "next/og";

import { SITE } from "@/config/site";

export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "72px 80px",
        background: "linear-gradient(160deg, #F8F9F9 0%, #17494D 100%)",
        color: "#03363D",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 36,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: "#03363D",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          K
        </div>
        <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>{SITE.name}</span>
      </div>
      <div
        style={{
          fontSize: 58,
          fontWeight: 700,
          lineHeight: 1.08,
          letterSpacing: "-0.03em",
          maxWidth: 900,
        }}
      >
        {SITE.tagline}
      </div>
      <div
        style={{
          marginTop: 28,
          fontSize: 28,
          lineHeight: 1.45,
          color: "#2F3941",
          maxWidth: 880,
        }}
      >
        {SITE.description}
      </div>
    </div>,
    size
  );
}
