import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dilemma = searchParams.get("d") || "迷いを記録中";
  const axis = searchParams.get("a") || "自分の軸を見つける";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0A0A",
          color: "#FAFAFA",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          MayoLog
        </div>
        <div
          style={{
            fontSize: 28,
            marginTop: 48,
            color: "#A3A3A3",
            letterSpacing: "0.05em",
          }}
        >
          迷いの記録
        </div>
        <div
          style={{
            fontSize: 36,
            marginTop: 20,
            fontWeight: 600,
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.4,
          }}
        >
          「{dilemma}」
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: 24,
            marginTop: 32,
            color: "#A3A3A3",
          }}
        >
          判断軸：{axis}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: 18,
            color: "#525252",
          }}
        >
          迷ったら5秒で記録、勝手に自分の軸が見える
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
