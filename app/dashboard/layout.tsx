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

export const metadata: Metadata = {
  title: "Vnus AI — Agentic Vnus",
  description: "The agentic AI that actually does things. Manages your emails, calendar, tasks and more.",
  keywords: ["AI agent", "automation", "Vnus AI", "agentic AI", "productivity"],
  openGraph: {
    title: "Vnus AI — Agentic Vnus",
    description: "The agentic AI that actually does things.",
    type: "website",
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
