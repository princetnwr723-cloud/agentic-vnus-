import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vnus AI — Agentic Vnus",
  description:
    "The agentic AI that actually does things. Manages your emails, calendar, tasks and more — all from the chat apps you already use.",
  keywords: ["AI agent", "automation", "Vnus AI", "agentic AI", "productivity"],
  openGraph: {
    title: "Vnus AI — Agentic Vnus",
    description: "The agentic AI that actually does things.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}