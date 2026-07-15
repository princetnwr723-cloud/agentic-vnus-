"use client";
import { useRef, useEffect, useState } from "react";
import AuthModal from "./auth/AuthModal";
import PricingModal from "./PricingModal";
import { useAuth } from "@/lib/AuthContext";

export default function FinalCTA() {
  const sectionRef              = useRef<HTMLElement>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("visible"); },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <section
        ref={sectionRef as React.RefObject<HTMLElement>}
        className="reveal relative z-10 max-w-4xl mx-auto px-6 py-24 text-center"
      >
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,59,48,0.06) 0%, transparent 70%)" }}
          aria-hidden
        />

        <div
          className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
          style={{ background: "rgba(255,59,48,0.1)", color: "#FF3B30", border: "1px solid rgba(255,59,48,0.25)" }}
        >
          Ready to unleash the demon?
        </div>

        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
          Stop doing things<br />
          <span className="gradient-text">Vnus can do for you.</span>
        </h2>

        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Join thousands of people who let Vnus handle the mundane so they can focus on what actually matters.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <a href="/dashboard" className="btn-primary px-10 py-4 rounded-xl text-white font-bold text-base flex items-center gap-2">
              Open Dashboard 
            </a>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="btn-primary px-10 py-4 rounded-xl text-white font-bold text-base flex items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Set Up Agentic Vnus — Free
            </button>
          )}

          {/* See Plans — opens pricing modal */}
          <button
            onClick={() => setPricingOpen(true)}
            className="btn-ghost px-8 py-4 rounded-xl text-gray-300 font-semibold text-base flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            See Plans
          </button>
        </div>

        <p className="text-gray-600 text-sm mt-6">
          No credit card required · Works in 5 minutes · Runs on your machine
        </p>
      </section>

      <AuthModal    isOpen={authOpen}    onClose={() => setAuthOpen(false)}    defaultTab="signup" />
      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />
    </>
  );
}