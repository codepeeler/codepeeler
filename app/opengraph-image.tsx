import { ImageResponse } from "next/og";

export const alt = "CodePeeler — Your All-in-One Developer Workspace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens copied from app/globals.css — keep in sync if the palette changes.
const BG = "#09090B";
const BORDER = "#24262E";
const TEXT = "#F4F4F6";
const TEXT_DIM = "#9A9CA6";
const PRIMARY = "#6D5DF6";
const SECONDARY = "#4F9DFF";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: BG,
          backgroundImage: `radial-gradient(circle at 85% 20%, ${PRIMARY}33, transparent 55%), radial-gradient(circle at 10% 90%, ${SECONDARY}26, transparent 50%)`,
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,
            fontSize: 48,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 40,
          }}
        >
          {"{ }"}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            color: TEXT,
            letterSpacing: "-0.02em",
          }}
        >
          CodePeeler
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 32,
            color: TEXT_DIM,
            maxWidth: 900,
          }}
        >
          Your all-in-one developer workspace — format, convert, decode &amp; generate
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 56,
            paddingTop: 32,
            borderTop: `1px solid ${BORDER}`,
            width: "100%",
            fontSize: 26,
            color: TEXT_DIM,
          }}
        >
          codepeeler.in
        </div>
      </div>
    ),
    { ...size }
  );
}
