import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { Toaster } from "react-hot-toast";

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

export const metadata = {
  title: "Agentic Vnus — The AI Demon That Lives on Your PC",
  description: "Local AI agent. No cloud. No subscription. Self-improving. Launches August 15, 2026.",
  openGraph: {
    title: "Introducing Agentic Vnus 👹",
    description: "The AI demon that lives on your PC. No cloud. No data leaving. Launches August 15.",
    url: "https://agenticvnus.com",
    siteName: "Agentic Vnus",
    images: [
      {
        url: "https://agentic-vnus.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Agentic Vnus — Ready to Unleash the Demon?",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Introducing Agentic Vnus 👹",
    description: "The AI demon that lives on your PC. No cloud. Launches August 15.",
    images: ["https://agentic-vnus.vercel.app/og-image.png"],
    creator: "@AgenticVnus",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1a0a0a",
                color: "#ffffff",
                border: "1px solid rgba(255,59,48,0.3)",
                borderRadius: "12px",
                fontSize: "13px",
                fontFamily: "Inter, sans-serif",
              },
              success: {
                iconTheme: { primary: "#FF3B30", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#FF3B30", secondary: "#fff" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}