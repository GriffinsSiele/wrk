import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Olynixx Praxis — Where trusted specialists are made";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#0c0f12",
          color: "#f2ede3",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "60px 80px",
            border: "1px solid rgba(150,118,43,0.45)",
          }}
        >
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "#c9962e",
              marginBottom: 28,
            }}
          >
            Olynixx Praxis
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 500,
              textAlign: "center",
              lineHeight: 1.15,
              maxWidth: 900,
            }}
          >
            Where trusted specialists are made.
          </div>
          <div
            style={{
              marginTop: 32,
              fontSize: 20,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#d9ac4a",
            }}
          >
            Learn + Certify + Deploy
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
