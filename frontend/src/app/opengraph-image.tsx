import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HypeUp — Türkiye'nin SMM Paneli";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#07060f",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Arka plan orb */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.45) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "#7C3AED",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white" stroke="none" />
            </svg>
          </div>
          <span style={{ color: "white", fontSize: "36px", fontWeight: "bold" }}>
            HypeUp
          </span>
        </div>

        {/* Başlık */}
        <div
          style={{
            color: "white",
            fontSize: "64px",
            fontWeight: "900",
            lineHeight: 1.1,
            marginBottom: "24px",
            maxWidth: "800px",
          }}
        >
          Sosyal medyada{" "}
          <span style={{ color: "#a78bfa" }}>hızlı büyü.</span>
        </div>

        {/* Alt metin */}
        <div
          style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: "28px",
            marginBottom: "48px",
            maxWidth: "700px",
          }}
        >
          Instagram, TikTok, YouTube, X — Anlık teslimat, gerçek TL fiyatları
        </div>

        {/* Platform rozetleri */}
        <div style={{ display: "flex", gap: "12px" }}>
          {["Instagram", "TikTok", "YouTube", "X"].map((p) => (
            <div
              key={p}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px",
                padding: "8px 18px",
                color: "rgba(255,255,255,0.7)",
                fontSize: "20px",
              }}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
