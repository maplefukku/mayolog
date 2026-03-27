import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MayoLog - 迷ったら5秒で記録",
  description:
    "迷った瞬間を5秒で記録。AIが判断パターンを分析し、自分の軸が見える。",
  openGraph: {
    title: "MayoLog - 迷ったら5秒で記録",
    description: "迷いを記録するだけで、自分の判断軸が見える",
    images: ["/api/og"],
  },
  twitter: {
    card: "summary_large_image",
    title: "MayoLog",
    description: "迷ったら5秒で記録、勝手に自分の軸が見える",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${inter.variable} ${notoSansJP.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
