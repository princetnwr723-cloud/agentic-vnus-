"use client";
import { useEffect, useRef, useState } from "react";
import AuthModal from "./auth/AuthModal";
import PricingModal from "./PricingModal";
import { useAuth } from "@/lib/AuthContext";

function AgentOrbit() {
  return (
    <svg width="220" height="220" viewBox="0 0 220 220" fill="none" aria-hidden>
      <circle cx="110" cy="110" r="70" stroke="#1c1c1c" strokeWidth="1" />
      <circle cx="110" cy="110" r="46" stroke="#1c1c1c" strokeWidth="1" />
      <g style={{ transformOrigin: "110px 110px", animation: "vnusSpin 18s linear infinite" }}>
        <circle cx="110" cy="40" r="4" fill="#FF3B30" />
      </g>
      <g style={{ transformOrigin: "110px 110px", animation: "vnusSpin 12s linear infinite reverse" }}>
        <circle cx="156" cy="110" r="3.5" fill="#ffffff" />
      </g>
      <g style={{ transformOrigin: "110px 110px", animation: "vnusSpin 24s linear infinite" }}>
        <circle cx="110" cy="180" r="3" fill="#7a7a7a" />
      </g>
      <circle cx="110" cy="110" r="22" fill="#0a0a0a" stroke="#2a2a2a" />
      <circle cx="110" cy="110" r="10" fill="#FF3B30" opacity="0.9">
        <animate attributeName="r" values="9;12;9" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2.4s" repeatCount="indefinite" />
      </circle>
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
        <a href="#skills" className="grok-badge mb-8 relative z-10">
          <span className="dot" />
          <span className="grok-badge-tag">NEW</span>
          Agentic Vnus now runs multi-agent teams
        </a>

        <div className="relative z-10 mb-6">
          <AgentOrbit />
        </div>

        <h1
          ref={headingRef}
          className="relative z-10 text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-5 max-w-4xl"
          style={{ opacity: 0, color: "#f5f5f5" }}
        >
          A new kind of<br />
          <span className="gradient-text">AI colleague.</span>
        </h1>

        <p
          ref={subRef}
          className="relative z-10 text-[#8a8a8a] text-base md:text-lg max-w-xl leading-relaxed mb-10"
          style={{ opacity: 0 }}
        >
          Agentic Vnus gets its own PC to work with. It signs into your apps,
          clears your inbox, runs your calendar, and comes back with finished
          work — while you do something else.
        </p>

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

      {/* ── Grok-style theme, self-contained — no manual globals.css edit needed ── */}
      <style jsx global>{`
        :root {
          --g-bg: #000000;
          --g-surface: #0a0a0a;
          --g-border: #1c1c1c;
          --g-border2: #2a2a2a;
          --g-text: #f5f5f5;
          --g-muted: #7a7a7a;
          --g-accent: #FF3B30;
        }
        @keyframes vnusSpin { to { transform: rotate(360deg); } }
        @keyframes grokPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.5; transform:scale(.8); } }
        @keyframes grokBlink { 50% { opacity: 0; } }
        @keyframes grokDash { to { stroke-dashoffset: -24; } }

        .grok-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px 6px 6px; border-radius: 999px;
          border: 1px solid var(--g-border2); background: rgba(255,255,255,0.02);
          font-size: 12.5px; color: var(--g-muted);
          transition: border-color .2s ease, background .2s ease;
        }
        .grok-badge:hover { border-color: #3a3a3a; background: rgba(255,255,255,0.04); }
        .grok-badge .dot {
          width: 6px; height: 6px; border-radius: 50%; background: var(--g-accent);
          box-shadow: 0 0 8px var(--g-accent); flex-shrink: 0;
          animation: grokPulse 2s ease-in-out infinite;
        }
        .grok-badge-tag {
          font-size: 10.5px; font-weight: 700; color: #000; background: var(--g-text);
          padding: 2px 8px; border-radius: 999px; letter-spacing: .02em;
        }

        .grok-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #ffffff; color: #000000; font-weight: 600;
          border-radius: 999px; padding: 12px 24px; border: 1px solid #fff;
          transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
        }
        .grok-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(255,255,255,0.12); background: #f0f0f0; }

        .grok-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: var(--g-text); font-weight: 600;
          border-radius: 999px; padding: 12px 24px; border: 1px solid var(--g-border2);
          transition: all .18s ease;
        }
        .grok-btn-ghost:hover { border-color: #4a4a4a; background: rgba(255,255,255,0.04); }

        .grok-card {
          background: var(--g-surface); border: 1px solid var(--g-border);
          border-radius: 16px; transition: border-color .25s ease, background .25s ease;
        }
        .grok-card:hover { border-color: var(--g-border2); background: #0d0d0d; }

        .grok-eyebrow {
          font-size: 12px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
          color: var(--g-muted); margin-bottom: 14px;
        }
        .grok-h2 {
          font-size: clamp(28px, 4vw, 44px); font-weight: 800; letter-spacing: -0.02em;
          line-height: 1.1; color: var(--g-text);
        }

        .grok-dot-grid {
          background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 26px 26px;
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%);
          mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%);
        }

        .grok-caret { display: inline-block; width: 2px; background: var(--g-text); animation: grokBlink 1s step-end infinite; }

        .grok-reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1); }
        .grok-reveal.visible { opacity: 1; transform: translateY(0); }

        .grok-bento { display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: minmax(170px, auto); gap: 14px; }
        .grok-bento .span-2 { grid-column: span 2; }
        @media (max-width: 900px) { .grok-bento { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .grok-bento { grid-template-columns: 1fr; } .grok-bento .span-2 { grid-column: span 1; } }

        .grok-faq-item { border-bottom: 1px solid var(--g-border); }
        .grok-faq-q {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 20px 4px; background: none; border: none; cursor: pointer; text-align: left;
          color: var(--g-text); font-size: 15.5px; font-weight: 600;
        }
        .grok-faq-chevron { transition: transform .25s ease; color: var(--g-muted); flex-shrink: 0; }
        .grok-faq-item.open .grok-faq-chevron { transform: rotate(45deg); }
        .grok-faq-a { max-height: 0; overflow: hidden; transition: max-height .3s ease, padding .3s ease; color: var(--g-muted); font-size: 14px; line-height: 1.7; padding: 0 4px; }
        .grok-faq-item.open .grok-faq-a { max-height: 240px; padding: 0 4px 20px; }
      `}</style>
    </>
  );
}