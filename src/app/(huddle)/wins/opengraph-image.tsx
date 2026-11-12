import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "Huddle Duck wins. Real results from real food brands, in their own words.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const wordmark = await readFile(
    join(process.cwd(), "public/brand/huddle/wordmark-white.png"),
  );
  const logo = `data:image/png;base64,${wordmark.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          background: "#08140f",
          color: "#fff",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "55px 65px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 26,
          }}
        >
          <img
            src={logo}
            width={190}
            height={46}
            style={{ objectFit: "contain" }}
            alt="Huddle Duck"
          />
          <div style={{ fontSize: 13, color: "#adc2b3", letterSpacing: "2px" }}>
            WINS
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 75,
            fontSize: 83,
            fontWeight: 700,
            lineHeight: 1.06,
            letterSpacing: "-5px",
          }}
        >
          <div>Real results.</div>
          <div style={{ color: "#1eba8f" }}>In their own words.</div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: 25,
            borderTop: "1px solid #42604d",
            fontSize: 20,
            color: "#b4c7bb",
          }}
        >
          <div>Food brands. Launches. Queues. Reviews.</div>
          <div>huddleduck.co.uk/wins</div>
        </div>
      </div>
    ),
    size,
  );
}
