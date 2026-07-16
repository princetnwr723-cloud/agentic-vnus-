"use client";
import { useEffect } from "react";

const Check = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
    <circle cx="12" cy="12" r="10" fill="rgba(74,222,128,0.12)" stroke="rgba(74,222,128,0.35)" strokeWidth="1.5"/>
    <polyline points="7 12 10 15 17 9" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Cross = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
    <circle cx="12" cy="12" r="10" fill="rgba(255,59,48,0.08)" stroke="rgba(255,59,48,0.2)" strokeWidth="1.5"/>
    <line x1="8" y1="8" x2="16" y2="16" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round"/>
    <line x1="16" y1="8" x2="8" y2="16" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const PLANS = [
  {
    tier: "Basic",
    tierColor: "#6b7280",
    name: "Free",
    price: 0,
    badge: null as string | null,
    tokens: "200K / mo",
    tasks: "~50 tasks",
    highlighted: false,
    features: [
      { label: "200K token limit",       ok: true  },
      { label: "~50 tasks / month",      ok: true  },
      { label: "1 PC workspace",         ok: true  },
      { label: "General skill only",     ok: true  },
      { label: "Community support",      ok: true  },
      { label: "Prompt caching",         ok: false },
      { label: "Marketplace access",     ok: false },
      { label: "Priority execution",     ok: false },
      { label: "Live PC view",           ok: false },
    ],
    note: "Bring your own API key",
  },
  {
    tier: "Basic",
    tierColor: "#6b7280",
    name: "Starter",
    price: 5,
    badge: "Popular" as string | null,
    tokens: "1M / mo",
    tasks: "~250 tasks",
    highlighted: true,
    features: [
      { label: "1M token limit",             ok: true  },
      { label: "~250 tasks / month",         ok: true  },
      { label: "2 PC workspaces",            ok: true  },
      { label: "All 6 built-in skills",      ok: true  },
      { label: "Prompt caching",             ok: true  },
      { label: "Email support",              ok: true  },
      { label: "Live PC view",               ok: true  },
      { label: "Marketplace access",         ok: false },
      { label: "Sell your skills",           ok: false },
    ],
    note: "No API key needed",
  },
  {
    tier: "Pro",
    tierColor: "#FF3B30",
    name: "Pro",
    price: 29,
    badge: "Best Value" as string | null,
    tokens: "2M / mo",
    tasks: "~500 tasks",
    highlighted: true,
    features: [
      { label: "2M token limit",             ok: true },
      { label: "~500 tasks / month",         ok: true },
      { label: "5 PC workspaces",            ok: true },
      { label: "Full marketplace access",    ok: true },
      { label: "Prompt caching",             ok: true },
      { label: "Sell skills & earn",         ok: true },
      { label: "Live view + history",        ok: true },
      { label: "Priority execution",         ok: true },
      { label: "Priority support",           ok: true },
    ],
    note: "Skill monetisation included",
  },
  {
    tier: "Pro",
    tierColor: "#FF3B30",
    name: "Pro Max",
    price: 60,
    badge: null as string | null,
    tokens: "5M / mo",
    tasks: "~1,250 tasks",
    highlighted: false,
    features: [
      { label: "5M token limit",             ok: true },
      { label: "~1,250 tasks / month",       ok: true },
      { label: "10 PC workspaces",           ok: true },
      { label: "Everything in Pro",          ok: true },
      { label: "AI skill builder",           ok: true },
      { label: "Task scheduler",             ok: true },
      { label: "Webhook triggers",           ok: true },
      { label: "Analytics dashboard",        ok: true },
      { label: "Dedicated support",          ok: true },
    ],
    note: "Best for agencies",
  },
  {
    tier: "Elite",
    tierColor: "#a855f7",
    name: "Elite",
    price: 499,
    badge: "Enterprise" as string | null,
    tokens: "20M / mo",
    tasks: "~5,000 tasks",
    highlighted: true,
    features: [
      { label: "20M token limit",            ok: true },
      { label: "~5,000 tasks / month",       ok: true },
      { label: "Unlimited workspaces",       ok: true },
      { label: "10 team seats",              ok: true },
      { label: "Role-based access",          ok: true },
      { label: "SOC 2 compliant",            ok: true },
      { label: "99.9% SLA uptime",           ok: true },
      { label: "Account manager",            ok: true },
      { label: "Onboarding call",            ok: true },
    ],
    note: "Onboarding call included",
  },
  {
    tier: "Elite",
    tierColor: "#a855f7",
    name: "Elite Ultra",
    price: 999,
    badge: "Max Power" as string | null,
    tokens: "40M / mo",
    tasks: "~10,000 tasks",
    highlighted: false,
    features: [
      { label: "40M token limit",            ok: true },
      { label: "~10,000 tasks / month",      ok: true },
      { label: "Unlimited team seats",       ok: true },
      { label: "White-label branding",       ok: true },
      { label: "Custom AI fine-tuning",      ok: true },
      { label: "Sub-1s priority execution",  ok: true },
      { label: "Custom SLA + legal",         ok: true },
      { label: "Everything in Elite",        ok: true },
      { label: "Custom contract",            ok: true },
    ],
    note: "Custom contract available",
  },
];

function PlanCard({ plan }: { plan: typeof PLANS[0] }) {
  const c = plan.tierColor;
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col shrink-0"
      style={{
        width: "calc(50% - 6px)",
        background:  plan.highlighted ? `${c}0e` : "rgba(255,255,255,0.02)",
        border:      `1px solid ${plan.highlighted ? c + "50" : "rgba(255,255,255,0.07)"}`,
        boxShadow:   plan.highlighted ? `0 0 20px ${c}15` : "none",
      }}
    >
      {plan.highlighted && (
        <div className="h-px w-full" style={{ background: `linear-gradient(to right,transparent,${c},transparent)` }} />
      )}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: c, opacity: 0.65 }}>
              {plan.tier}
            </p>
            <p className="text-white font-black text-sm leading-none">{plan.name}</p>
          </div>
          {plan.badge && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5"
              style={{ background: `${c}18`, color: c, border: `1px solid ${c}35` }}
            >
              {plan.badge}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end gap-1">
          <span className="text-white font-black text-2xl leading-none">
            {plan.price === 0 ? "Free" : `$${plan.price}`}
          </span>
          {plan.price > 0 && <span className="text-gray-600 text-xs mb-0.5">/ mo</span>}
        </div>

        {/* Token pill */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold w-fit"
          style={{ background: `${c}12`, color: c, border: `1px solid ${c}22` }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          {plan.tokens} · {plan.tasks}
        </div>

        <div className="h-px bg-white/5" />

        {/* Features */}
        <ul className="flex flex-col gap-1.5 flex-1">
          {plan.features.map((f) => (
            <li key={f.label} className="flex items-start gap-1.5">
              {f.ok ? <Check /> : <Cross />}
              <span className={`text-xs leading-relaxed ${f.ok ? "text-gray-300" : "text-gray-600"}`}>
                {f.label}
              </span>
            </li>
          ))}
        </ul>

        {plan.note && (
          <p className="text-gray-600 text-xs text-center pt-2 border-t border-white/5">{plan.note}</p>
        )}
      </div>
    </div>
  );
}

interface PricingModalProps {
  isOpen:  boolean;
  onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal */}
      <div
        className="relative z-10 w-full flex flex-col rounded-2xl overflow-hidden"
        style={{
          maxWidth:   "520px",
          maxHeight:  "82vh",
          background: "rgba(6,3,3,0.98)",
          border:     "1px solid rgba(255,59,48,0.2)",
          boxShadow:  "0 0 60px rgba(255,59,48,0.08), 0 25px 50px rgba(0,0,0,0.6)",
        }}
      >
        {/* Top glow line */}
        <div className="h-px w-full shrink-0" style={{ background: "linear-gradient(to right,transparent,#FF3B30,transparent)" }} />

        {/* Header — fixed */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-white font-black text-base leading-none">Plans &amp; Pricing</h2>
            <p className="text-gray-500 text-xs mt-1">Scroll to see all 6 plans · No lock-in</p>
          </div>

          {/* Tier dots legend */}
          <div className="flex items-center gap-3 mr-3">
            {[
              { label: "Basic", color: "#6b7280" },
              { label: "Pro",   color: "#FF3B30" },
              { label: "Elite", color: "#a855f7" },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.color, boxShadow: `0 0 4px ${t.color}` }} />
                <span className="text-xs" style={{ color: t.color }}>{t.label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-white/10 text-gray-500 hover:text-white hover:border-white/25 hover:bg-white/5 transition-all shrink-0"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6"  x2="6"  y2="18"/>
              <line x1="6"  y1="6"  x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable plans area — 2 cards visible at a time */}
        <div
          className="overflow-y-auto px-5 py-4 flex-1"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#FF3B30 transparent" }}
        >
          {/* Tier: Basic */}
          <div className="mb-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500" style={{ boxShadow: "0 0 4px #6b7280" }} />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Basic</span>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-500/30 to-transparent" />
            </div>
            <div className="flex gap-3">
              {PLANS.filter((p) => p.tier === "Basic").map((plan) => (
                <PlanCard key={plan.name} plan={plan} />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/5 my-4" />

          {/* Tier: Pro */}
          <div className="mb-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" style={{ boxShadow: "0 0 4px #FF3B30" }} />
              <span className="text-xs font-bold uppercase tracking-widest text-[#FF3B30]">Pro</span>
              <div className="flex-1 h-px bg-gradient-to-r from-[#FF3B30]/30 to-transparent" />
            </div>
            <div className="flex gap-3">
              {PLANS.filter((p) => p.tier === "Pro").map((plan) => (
                <PlanCard key={plan.name} plan={plan} />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/5 my-4" />

          {/* Tier: Elite */}
          <div className="mb-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" style={{ boxShadow: "0 0 4px #a855f7" }} />
              <span className="text-xs font-bold uppercase tracking-widest text-[#a855f7]">Elite</span>
              <div className="flex-1 h-px bg-gradient-to-r from-[#a855f7]/30 to-transparent" />
            </div>
            <div className="flex gap-3">
              {PLANS.filter((p) => p.tier === "Elite").map((plan) => (
                <PlanCard key={plan.name} plan={plan} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer — fixed */}
        <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between shrink-0">
          <p className="text-gray-700 text-xs">7-day free trial on all paid plans</p>
          <a href="mailto:hello@vnus.ai" className="text-xs text-[#FF3B30] hover:underline">
            Custom plan?
          </a>
        </div>
      </div>
    </div>
  );
}