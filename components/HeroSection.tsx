"use client";
import { useEffect, useRef, useState } from "react";
import DemonMascot from "./DemonMascot";
import AuthModal from "./auth/AuthModal";
import PricingModal from "./PricingModal";
import { useAuth } from "@/lib/AuthContext";

export default function HeroSection() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef     = useRef<HTMLParagraphElement>(null);
  const ctaRef     = useRef<HTMLDivElement>(null);

  const [authOpen,    setAuthOpen]    = useState(false);
  const [authTab,     setAuthTab]     = useState<"login" | "signup">("signup");
  const [pricingOpen, setPricingOpen] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const els = [headingRef.current, subRef.current, ctaRef.current];
    els.forEach((el, i) => {
      if (!el) return;
      el.style.opacity   = "0";
      el.style.transform = "translateY(40px)";
      setTimeout(() => {
        if (!el) return;
        el.style.transition = "opacity 0.8s ease, transform 0.8s ease";
        el.style.opacity    = "1";
        el.style.transform  = "translateY(0)";
      }, 200 + i * 180);
    });
  }, []);

  const openAuth = (tab: "login" | "signup") => {
    setAuthTab(tab);
    setAuthOpen(true);
  };

  return (
    <>
      <section
        id="home"
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden"
      >
        {/* Ambient glow — existing class */}
        <div className="hero-glow" aria-hidden />

        {/* Dot-grid backdrop, pure tailwind + inline style, no new global class needed */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse 70% 55% at 50% 25%, #000 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 25%, #000 30%, transparent 75%)",
          }}
          aria-hidden
        />

        {/* Badge */}
        <a
          href="#skills"
          className="relative z-10 inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.02] text-xs text-gray-400 hover:border-white/20 hover:text-gray-200 transition-all"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" style={{ animation: "pulseGlow 2s ease-in-out infinite" }} />
          <span className="text-[10px] font-bold text-black bg-white px-2 py-0.5 rounded-full">NEW</span>
          Multi-agent teams + Business DNA now live
        </a>

        {/* Demon mascot */}
        <div className="relative z-10 mb-4">
          <DemonMascot size={180} />
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-4 w-28 h-6 rounded-full"
            style={{
              background: "radial-gradient(ellipse, rgba(255,59,48,0.35) 0%, transparent 70%)",
              filter: "blur(6px)",
              animation: "pulseGlow 3s ease-in-out infinite",
            }}
            aria-hidden
          />
        </div>

        {/* Heading */}
        <h1
          ref={headingRef}
          className="relative z-10 text-6xl md:text-8xl font-black tracking-tight leading-none mb-4"
          style={{ opacity: 0 }}
        >
          <span className="gradient-text">Agentic Vnus</span>
        </h1>

        {/* Tagline */}
        <p
          ref={subRef}
          className="relative z-10 text-[#FF3B30] uppercase tracking-[0.25em] font-semibold text-sm md:text-base mb-6"
          style={{ opacity: 0 }}
        >
          A New Kind Of AI Colleague.
        </p>

        {/* Description */}
        <p
          className="relative z-10 text-gray-400 text-base md:text-lg max-w-2xl leading-relaxed mb-10"
          style={{ opacity: 0, animation: "fadeIn 1s ease 0.6s forwards" }}
        >
          Vnus gets its own PC to work with. It signs into your apps, clears your
          inbox, runs your calendar, and comes back with finished work — all from
          WhatsApp, Telegram, or any chat app you already use.
        </p>

        {/* CTA */}
        <div
          ref={ctaRef}
          className="relative z-10 flex flex-col sm:flex-row gap-4 items-center"
          style={{ opacity: 0 }}
        >
          {user ? (
            <a
              href="/dashboard"
              className="btn-primary px-8 py-3.5 rounded-xl text-white font-bold text-base flex items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
              Open Dashboard
            </a>
          ) : (
            <button
              onClick={() => openAuth("signup")}
              className="btn-primary px-8 py-3.5 rounded-xl text-white font-bold text-base flex items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Get Started — Free
            </button>
          )}

          <button
            onClick={() => setPricingOpen(true)}
            className="btn-ghost px-8 py-3.5 rounded-xl text-white font-semibold text-base flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            See Plans
          </button>
        </div>

        {/* Platform badges */}
        <div
          className="relative z-10 flex items-center gap-3 mt-10 flex-wrap justify-center"
          style={{ opacity: 0, animation: "fadeIn 1s ease 1s forwards" }}
        >
          {["macOS & Linux", "Windows", "β BETA"].map((badge, i) => (
            <span
              key={badge}
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                i === 0
                  ? "bg-[#FF3B30] border-[#FF3B30] text-white"
                  : i === 2
                  ? "bg-transparent border-white/20 text-gray-400"
                  : "bg-transparent border-white/15 text-gray-500"
              }`}
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600"
          style={{ animation: "float 2.5s ease-in-out infinite" }}
          aria-hidden
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </div>
      </section>

      <AuthModal    isOpen={authOpen}    onClose={() => setAuthOpen(false)}    defaultTab={authTab} />
      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />
    </>
  );
}