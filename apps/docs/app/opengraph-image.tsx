import { ImageResponse } from "next/og";

export const alt = "Moe UI — Web components you own";
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
        justifyContent: "space-between",
        background: "#11100e",
        color: "#f6f3ec",
        padding: 72,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 24,
          letterSpacing: "0.18em",
          color: "#f59e0b",
        }}
      >
        MOE UI · WEB BETA
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 82,
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
          }}
        >
          Build the interface.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 82,
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
            color: "#f59e0b",
          }}
        >
          Keep the source.
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 24, color: "#a3a3a3" }}>
        31 components · Next.js · WCAG 2.2 AA interactions
      </div>
    </div>,
    size,
  );
}
