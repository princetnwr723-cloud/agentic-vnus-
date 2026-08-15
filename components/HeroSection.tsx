"use client";
import { useEffect, useRef, useState } from "react";
import AuthModal from "./auth/AuthModal";
import PricingModal from "./PricingModal";
import { useAuth } from "@/lib/AuthContext";

// Small animated node graphic — replaces the big demon mascot on the hero
// so the hero reads closer to Grok Bot's minimal product shot.
function AgentOrbit() {
  return (
    <svg width="220" height="220" viewBox="0 0 220 220" fill="none" aria-hidden>
      <circle cx="110" cy="110" r="70" stroke="#1c1c1c" strokeWidth="1" />
      <circle cx="110" cy="110" r="46" stroke="#1c1c1c" strokeWidth="1" />
      {/* orbit rings that slowly rotate */}
      <g style={{ transformOrigin: "110px 110px", animation: "spin 18s linear infinite" }}>
        <circle cx="110" cy="40" r="4" fill="#FF3B30" className="grok-node" style={{ color: "#FF3B30" }} />
      </g>
      <g style={{ transformOrigin: "110px 110px", animation: "spin 12s linear infinite reverse" }}>
        <circle cx="156" cy="110" r="3.5" fill="#ffffff" className="grok-node" style={{ color: "#ffffff" }} />
      </g>
      <g style={{ transformOrigin: "110px 110px", animation: "spin 24s linear infinite" }}>
        <circle cx="110" cy="180" r="3" fill="#7a7a7a" className="grok-node" style={{ color: "#7a7a7a" }} />
      </g>
      {/* core */}
      <circle cx="110" cy="110" r="22" fill="#0a0a0a" stroke="#2a2a2a" />
      <circle cx="110" cy="110" r="10" fill="#FF3B30" opacity="0.9">
        <animate attributeName="r" values="9;12;9" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

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
      el.style.transform = "translateY(28px)";
      setTimeout(() => {
        if (!el) return;
        el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
        el.style.opacity    = "1";
        el.style.transform  = "translateY(0)";
      }, 150 + i * 150);
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
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-16 overflow-hidden grok-dot-grid"
      >
        {/* Badge */}
        <a href="#skills" className="grok-badge mb-8 relative z-10">
          <span className="dot" />
          <span className="grok-badge-tag">NEW</span>
          Agentic Vnus now runs multi-agent teams
        </a>

        {/* Orbit graphic */}
        <div className="relative z-10 mb-6">
          <AgentOrbit />
        </div>

        {/* Heading */}
        <h1
          ref={headingRef}
          className="relative z-10 text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-5 max-w-4xl"
          style={{ opacity: 0, color: "#f5f5f5" }}
        >
          A new kind of<br />
          <span className="gradient-text">AI colleague.</span>
        </h1>

        {/* Description */}
        <p
          ref={subRef}
          className="relative z-10 text-[#8a8a8a] text-base md:text-lg max-w-xl leading-relaxed mb-10"
          style={{ opacity: 0 }}
        >
          Agentic Vnus gets its own PC to work with. It signs into your apps,
          clears your inbox, runs your calendar, and comes back with finished
          work — while you do something else.
        </p>

        {/* CTA */}
        <div
          ref={ctaRef}
          className="relative z-10 flex flex-col sm:flex-row gap-3 items-center"
          style={{ opacity: 0 }}
        >
          {user ? (
            <a href="/dashboard" className="grok-btn-primary text-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
              Open Dashboard
            </a>
          ) : (
            <button onClick={() => openAuth("signup")} className="grok-btn-primary text-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              Download for macOS
            </button>
          )}

          <button onClick={() => setPricingOpen(true)} className="grok-btn-ghost text-sm">
            See plans
          </button>
        </div>

        {/* Platform badges */}
        <div
          className="relative z-10 flex items-center gap-2.5 mt-9 flex-wrap justify-center"
          style={{ opacity: 0, animation: "fadeIn 1s ease 1s forwards" }}
        >
          {["macOS", "Windows", "Linux", "β Early Access"].map((badge) => (
            <span key={badge} className="px-3 py-1 rounded-full text-xs font-medium border border-[#1c1c1c] text-[#666] bg-[#0a0a0a]">
              {badge}
            </span>
          ))}
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-700"
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