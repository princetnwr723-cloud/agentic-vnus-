"use client";
import { useState } from "react";

// ── Icons ──────────────────────────────────────────────────
const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
    <circle cx="12" cy="12" r="10" fill="rgba(74,222,128,0.15)" stroke="rgba(74,222,128,0.4)" strokeWidth="1.5"/>
    <polyline points="7 12 10 15 17 9" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Cross = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
    <circle cx="12" cy="12" r="10" fill="rgba(255,59,48,0.1)" stroke="rgba(255,59,48,0.25)" strokeWidth="1.5"/>
    <line x1="8" y1="8" x2="16" y2="16" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round"/>
    <line x1="16" y1="8" x2="8" y2="16" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// ── Plan Data ──────────────────────────────────────────────
const TIERS = [
  // ── BASIC ──
  {
    tier: "Basic",
    color: "#6b7280",
    glowColor: "rgba(107,114,128,0.15)",
    borderColor: "rgba(107,114,128,0.25)",
    plans: [
      {
        name: "Free",
        price: 0,
        badge: null,
        tokens: "200K tokens / mo",
        tasks: "~50 tasks / mo",
        caching: false,
        apiKey: true,
        description: "Try Vnus with your own API key. No card needed.",
        features: [
          { label: "200K token limit / month", ok: true },
          { label: "~50 tasks (avg 4K tokens each)", ok: true },
          { label: "1 PC workspace", ok: true },
          { label: "General skill only", ok: true },
          { label: "Community support", ok: true },
          { label: "Prompt caching", ok: false },
          { label: "Skill marketplace access", ok: false },
          { label: "Priority execution", ok: false },
          { label: "Live PC view", ok: false },
        ],
        ctaLabel: "Get Started Free",
        ctaStyle: "ghost",
        note: "Requires your own ChatGPT / Claude API key",
      },
      {
        name: "Starter",
        price: 5,
        badge: "Popular",
        tokens: "1M tokens / mo",
        tasks: "~250 tasks / mo",
        caching: true,
        apiKey: false,
        description: "Our key, your control. Best for daily automation.",
        features: [
          { label: "1M token limit / month", ok: true },
          { label: "~250 tasks / month", ok: true },
          { label: "2 PC workspaces", ok: true },
          { label: "All 6 built-in skills", ok: true },
          { label: "Prompt caching (faster + cheaper)", ok: true },
          { label: "Email support", ok: true },
          { label: "Live PC view", ok: true },
          { label: "Skill marketplace access", ok: false },
          { label: "Sell your own skills", ok: false },
        ],
        ctaLabel: "Start for $5 / mo",
        ctaStyle: "primary",
        note: "No API key needed — we handle it",
      },
    ],
  },

  // ── PRO ──
  {
    tier: "Pro",
    color: "#FF3B30",
    glowColor: "rgba(255,59,48,0.12)",
    borderColor: "rgba(255,59,48,0.35)",
    plans: [
      {
        name: "Pro",
        price: 29,
        badge: "Best Value",
        tokens: "2M tokens / mo",
        tasks: "~500 tasks / mo",
        caching: true,
        apiKey: false,
        description: "For power users who automate everything.",
        features: [
          { label: "2M token limit / month", ok: true },
          { label: "~500 tasks / month", ok: true },
          { label: "5 PC workspaces", ok: true },
          { label: "All skills + marketplace access", ok: true },
          { label: "Prompt caching", ok: true },
          { label: "Sell your skills (earn per install)", ok: true },
          { label: "Live PC view + history", ok: true },
          { label: "Priority task execution", ok: true },
          { label: "Priority email support", ok: true },
        ],
        ctaLabel: "Go Pro — $29 / mo",
        ctaStyle: "red",
        note: "Includes skill monetisation from day one",
      },
      {
        name: "Pro Max",
        price: 60,
        badge: null,
        tokens: "5M tokens / mo",
        tasks: "~1,250 tasks / mo",
        caching: true,
        apiKey: false,
        description: "More headroom, more workspaces, more power.",
        features: [
          { label: "5M token limit / month", ok: true },
          { label: "~1,250 tasks / month", ok: true },
          { label: "10 PC workspaces", ok: true },
          { label: "Everything in Pro", ok: true },
          { label: "Custom skill builder (AI-assisted)", ok: true },
          { label: "Task scheduler (cron-style)", ok: true },
          { label: "Webhook triggers", ok: true },
          { label: "Analytics dashboard", ok: true },
          { label: "Dedicated support", ok: true },
        ],
        ctaLabel: "Go Pro Max — $60 / mo",
        ctaStyle: "red",
        note: "Best for agencies & power automators",
      },
    ],
  },

  // ── ELITE ──
  {
    tier: "Elite",
    color: "#a855f7",
    glowColor: "rgba(168,85,247,0.12)",
    borderColor: "rgba(168,85,247,0.35)",
    plans: [
      {
        name: "Elite",
        price: 499,
        badge: "Enterprise",
        tokens: "20M tokens / mo",
        tasks: "~5,000 tasks / mo",
        caching: true,
        apiKey: false,
        description: "For teams running serious automation at scale.",
        features: [
          { label: "20M token limit / month", ok: true },
          { label: "~5,000 tasks / month", ok: true },
          { label: "Unlimited PC workspaces", ok: true },
          { label: "Everything in Pro Max", ok: true },
          { label: "Team seats (up to 10 members)", ok: true },
          { label: "Role-based access control", ok: true },
          { label: "SOC 2 compliant data handling", ok: true },
          { label: "SLA — 99.9% uptime guarantee", ok: true },
          { label: "Dedicated account manager", ok: true },
        ],
        ctaLabel: "Get Elite — $499 / mo",
        ctaStyle: "purple",
        note: "Onboarding call included",
      },
      {
        name: "Elite Ultra",
        price: 999,
        badge: "Max Power",
        tokens: "40M tokens / mo",
        tasks: "~10,000 tasks / mo",
        caching: true,
        apiKey: false,
        description: "Unlimited everything for the most demanding orgs.",
        features: [
          { label: "40M token limit / month", ok: true },
          { label: "~10,000 tasks / month", ok: true },
          { label: "Unlimited PC workspaces", ok: true },
          { label: "Everything in Elite", ok: true },
          { label: "Unlimited team seats", ok: true },
          { label: "White-label agent branding", ok: true },
          { label: "Custom AI model fine-tuning", ok: true },
          { label: "Priority API lane (sub-1s execution)", ok: true },
          { label: "Custom SLA + legal agreements", ok: true },
        ],
        ctaLabel: "Get Elite Ultra — $999 / mo",
        ctaStyle: "purple",
        note: "Custom contract available on request",
      },
    ],
  },
];

// ── CTA Button ─────────────────────────────────────────────
function CtaButton({ label, style }: { label: string; style: string }) {
  const base = "w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2";

  if (style === "ghost")
    return (
      <button className={`${base} border border-white/15 text-gray-300 hover:border-white/30 hover:text-white`}>
        {label}
      </button>
    );
  if (style === "primary")
    return (
      <button className={`${base} bg-white/8 border border-white/20 text-white hover:bg-white/14`}>
        {label}
      </button>
    );
  if (style === "red")
    return (
      <button
        className={`${base} text-white`}
        style={{ background: "linear-gradient(135deg,#FF3B30,#CC1A10)", boxShadow: "0 4px 20px rgba(255,59,48,0.25)" }}
      >
        {label}
      </button>
    );
  if (style === "purple")
    return (
      <button
        className={`${base} text-white`}
        style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", boxShadow: "0 4px 20px rgba(168,85,247,0.25)" }}
      >
        {label}
      </button>
    );
  return null;
}

// ── Plan Card ──────────────────────────────────────────────
function PlanCard({
  plan,
  tierColor,
  tierBorder,
  tierGlow,
  isHighlighted,
}: {
  plan: (typeof TIERS)[0]["plans"][0];
  tierColor: string;
  tierBorder: string;
  tierGlow: string;
  isHighlighted: boolean;
}) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: isHighlighted
          ? `linear-gradient(160deg, ${tierGlow}, rgba(8,4,4,0.97))`
          : "rgba(8,4,4,0.97)",
        border: `1px solid ${isHighlighted ? tierBorder : "rgba(255,255,255,0.07)"}`,
        boxShadow: isHighlighted ? `0 0 40px ${tierGlow}` : "none",
      }}
    >
      {/* top glow line */}
      {isHighlighted && (
        <div
          className="h-px w-full"
          style={{ background: `linear-gradient(to right, transparent, ${tierColor}, transparent)` }}
        />
      )}

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-white font-bold text-sm">{plan.name}</span>
            {plan.badge && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: `${tierColor}18`,
                  color: tierColor,
                  border: `1px solid ${tierColor}40`,
                }}
              >
                {plan.badge}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-xs leading-relaxed">{plan.description}</p>
        </div>

        {/* Price */}
        <div className="flex items-end gap-1">
          <span className="text-white font-black text-3xl leading-none">
            {plan.price === 0 ? "Free" : `$${plan.price}`}
          </span>
          {plan.price > 0 && <span className="text-gray-600 text-xs mb-1">/ mo</span>}
        </div>

        {/* Token pill */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold w-fit"
          style={{ background: `${tierColor}12`, color: tierColor, border: `1px solid ${tierColor}25` }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          {plan.tokens} · {plan.tasks}
        </div>

        {/* Features */}
        <ul className="flex flex-col gap-2 flex-1">
          {plan.features.map((f) => (
            <li key={f.label} className="flex items-start gap-2">
              {f.ok ? <Check /> : <Cross />}
              <span className={`text-xs leading-relaxed ${f.ok ? "text-gray-300" : "text-gray-600"}`}>
                {f.label}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="pt-2 flex flex-col gap-2">
          <CtaButton label={plan.ctaLabel} style={plan.ctaStyle} />
          {plan.note && (
            <p className="text-gray-600 text-xs text-center leading-relaxed">{plan.note}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────
export default function PricingSection() {
  const [activeTier, setActiveTier] = useState<string | null>(null);

  return (
    <section id="pricing" className="relative z-10 max-w-6xl mx-auto px-6 py-20">
      {/* Heading */}
      <div className="text-center mb-12">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "#FF3B30" }}
        >
          Pricing
        </p>
        <h2 className="text-white font-black text-3xl md:text-4xl mb-3">
          Pick your plan.{" "}
          <span className="gradient-text">Automate everything.</span>
        </h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Start free with your own API key. Upgrade anytime — no lock-in, cancel whenever.
        </p>
      </div>

      {/* Tiers */}
      <div className="flex flex-col gap-10">
        {TIERS.map((tier) => (
          <div key={tier.tier}>
            {/* Tier label */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: tier.color, boxShadow: `0 0 6px ${tier.color}` }}
              />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: tier.color }}>
                {tier.tier}
              </span>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${tier.borderColor}, transparent)` }} />
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tier.plans.map((plan, i) => (
                <PlanCard
                  key={plan.name}
                  plan={plan}
                  tierColor={tier.color}
                  tierBorder={tier.borderColor}
                  tierGlow={tier.glowColor}
                  isHighlighted={i === 1 || plan.badge === "Best Value" || plan.badge === "Popular"}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom note */}
      <p className="text-center text-gray-700 text-xs mt-10">
        All plans include 7-day free trial · No credit card for Free plan ·{" "}
        <a href="mailto:hello@vnus.ai" className="text-[#FF3B30] hover:underline">
          Talk to us for custom needs
        </a>
      </p>
    </section>
  );
}