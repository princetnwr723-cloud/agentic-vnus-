"use client";
import { useEffect, useState } from "react";
import { useAuth }             from "@/lib/AuthContext";
import { auth }                from "@/lib/firebase";

// ── Icons ──────────────────────────────────────────────────
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

// ── LemonSqueezy checkout URLs (fill after creating products) ──
const LS_URLS: Record<string, string> = {
  starter:      process.env.NEXT_PUBLIC_LS_URL_STARTER     || "#",
  pro:          process.env.NEXT_PUBLIC_LS_URL_PRO         || "#",
  pro_max:      process.env.NEXT_PUBLIC_LS_URL_PRO_MAX     || "#",
  elite:        process.env.NEXT_PUBLIC_LS_URL_ELITE       || "#",
  elite_ultra:  process.env.NEXT_PUBLIC_LS_URL_ELITE_ULTRA || "#",
};

// ── Plan definitions ───────────────────────────────────────
const PLANS = [
  {
    tier:        "Basic",
    tierColor:   "#6b7280",
    key:         "free",
    name:        "Free",
    price:       0,
    badge:       null as string | null,
    tokens:      "200K / mo",
    tasks:       "~50 tasks",
    needsKey:    true,
    needsPayment:false,
    highlighted: false,
    ctaLabel:    "Start Free",
    features: [
      { label: "200K token limit",     ok: true  },
      { label: "~50 tasks / month",    ok: true  },
      { label: "1 PC workspace",       ok: true  },
      { label: "General skill only",   ok: true  },
      { label: "Community support",    ok: true  },
      { label: "Prompt caching",       ok: false },
      { label: "Marketplace access",   ok: false },
      { label: "Priority execution",   ok: false },
      { label: "Live PC view",         ok: false },
    ],
    note: "Your own OpenAI / Claude key",
  },
  {
    tier:        "Basic",
    tierColor:   "#6b7280",
    key:         "starter",
    name:        "Starter",
    price:       5,
    badge:       "Popular" as string | null,
    tokens:      "1M / mo",
    tasks:       "~250 tasks",
    needsKey:    true,
    needsPayment:true,
    highlighted: true,
    ctaLabel:    "Get Starter",
    features: [
      { label: "1M token limit",           ok: true  },
      { label: "~250 tasks / month",       ok: true  },
      { label: "2 PC workspaces",          ok: true  },
      { label: "All 6 built-in skills",    ok: true  },
      { label: "Prompt caching",           ok: true  },
      { label: "Email support",            ok: true  },
      { label: "Live PC view",             ok: true  },
      { label: "Marketplace access",       ok: false },
      { label: "Sell your skills",         ok: false },
    ],
    note: "Your own OpenAI / Claude key",
  },
  {
    tier:        "Pro",
    tierColor:   "#FF3B30",
    key:         "pro",
    name:        "Pro",
    price:       29,
    badge:       "Best Value" as string | null,
    tokens:      "2M / mo",
    tasks:       "~500 tasks",
    needsKey:    false,
    needsPayment:true,
    highlighted: true,
    ctaLabel:    "Go Pro",
    features: [
      { label: "2M token limit",           ok: true },
      { label: "~500 tasks / month",       ok: true },
      { label: "5 PC workspaces",          ok: true },
      { label: "Full marketplace access",  ok: true },
      { label: "Prompt caching",           ok: true },
      { label: "Sell skills & earn",       ok: true },
      { label: "Live view + history",      ok: true },
      { label: "Priority execution",       ok: true },
      { label: "Priority support",         ok: true },
    ],
    note: "No API key needed — we handle it",
  },
  {
    tier:        "Pro",
    tierColor:   "#FF3B30",
    key:         "pro_max",
    name:        "Pro Max",
    price:       60,
    badge:       null as string | null,
    tokens:      "5M / mo",
    tasks:       "~1,250 tasks",
    needsKey:    false,
    needsPayment:true,
    highlighted: false,
    ctaLabel:    "Go Pro Max",
    features: [
      { label: "5M token limit",           ok: true },
      { label: "~1,250 tasks / month",     ok: true },
      { label: "10 PC workspaces",         ok: true },
      { label: "Everything in Pro",        ok: true },
      { label: "AI skill builder",         ok: true },
      { label: "Task scheduler",           ok: true },
      { label: "Webhook triggers",         ok: true },
      { label: "Analytics dashboard",      ok: true },
      { label: "Dedicated support",        ok: true },
    ],
    note: "No API key needed — we handle it",
  },
  {
    tier:        "Elite",
    tierColor:   "#a855f7",
    key:         "elite",
    name:        "Elite",
    price:       499,
    badge:       "Enterprise" as string | null,
    tokens:      "20M / mo",
    tasks:       "~5,000 tasks",
    needsKey:    false,
    needsPayment:true,
    highlighted: true,
    ctaLabel:    "Get Elite",
    features: [
      { label: "20M token limit",          ok: true },
      { label: "~5,000 tasks / month",     ok: true },
      { label: "Unlimited workspaces",     ok: true },
      { label: "10 team seats",            ok: true },
      { label: "Role-based access",        ok: true },
      { label: "SOC 2 compliant",          ok: true },
      { label: "99.9% SLA uptime",         ok: true },
      { label: "Account manager",          ok: true },
      { label: "Onboarding call",          ok: true },
    ],
    note: "No API key needed — we handle it",
  },
  {
    tier:        "Elite",
    tierColor:   "#a855f7",
    key:         "elite_ultra",
    name:        "Elite Ultra",
    price:       999,
    badge:       "Max Power" as string | null,
    tokens:      "40M / mo",
    tasks:       "~10,000 tasks",
    needsKey:    false,
    needsPayment:true,
    highlighted: false,
    ctaLabel:    "Get Elite Ultra",
    features: [
      { label: "40M token limit",          ok: true },
      { label: "~10,000 tasks / month",    ok: true },
      { label: "Unlimited team seats",     ok: true },
      { label: "White-label branding",     ok: true },
      { label: "Custom AI fine-tuning",    ok: true },
      { label: "Sub-1s priority exec",     ok: true },
      { label: "Custom SLA + legal",       ok: true },
      { label: "Everything in Elite",      ok: true },
      { label: "Custom contract",          ok: true },
    ],
    note: "No API key needed — we handle it",
  },
];

// ── Plan Card ──────────────────────────────────────────────
function PlanCard({
  plan,
  onSelect,
  currentPlan,
}: {
  plan: typeof PLANS[0];
  onSelect: (plan: typeof PLANS[0]) => void;
  currentPlan: string;
}) {
  const c         = plan.tierColor;
  const isCurrent = currentPlan === plan.key;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col shrink-0"
      style={{
        width:      "calc(50% - 6px)",
        background:  plan.highlighted ? `${c}0e` : "rgba(255,255,255,0.02)",
        border:      `1px solid ${isCurrent ? "#4ade80" : plan.highlighted ? c + "50" : "rgba(255,255,255,0.07)"}`,
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
          <div className="flex flex-col items-end gap-1">
            {plan.badge && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${c}18`, color: c, border: `1px solid ${c}35` }}>
                {plan.badge}
              </span>
            )}
            {isCurrent && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/25">
                Current
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-end gap-1">
          <span className="text-white font-black text-2xl leading-none">
            {plan.price === 0 ? "Free" : `$${plan.price}`}
          </span>
          {plan.price > 0 && <span className="text-gray-600 text-xs mb-0.5">/ mo</span>}
        </div>

        {/* Token pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold w-fit" style={{ background: `${c}12`, color: c, border: `1px solid ${c}22` }}>
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

        {/* Key note */}
        {plan.needsKey && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-yellow-400/8 border border-yellow-400/20">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
            <span className="text-yellow-400/80 text-xs">{plan.note}</span>
          </div>
        )}

        {/* CTA Button */}
        {!isCurrent && (
          <button
            onClick={() => onSelect(plan)}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all mt-1"
            style={
              plan.highlighted
                ? { background: `linear-gradient(135deg,${c},${c}cc)`, color: "#fff", boxShadow: `0 4px 14px ${c}30` }
                : { background: `${c}15`, color: c, border: `1px solid ${c}30` }
            }
          >
            {plan.ctaLabel}
          </button>
        )}

        {isCurrent && (
          <div className="w-full py-2.5 rounded-xl text-sm font-bold text-center text-green-400 bg-green-500/10 border border-green-500/20">
            ✓ Active Plan
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────
export interface PricingModalProps {
  isOpen:       boolean;
  onClose:      () => void;
  currentPlan?: string;
  onPlanChosen?: (planKey: string) => void;
}

export default function PricingModal({
  isOpen,
  onClose,
  currentPlan  = "free",
  onPlanChosen,
}: PricingModalProps) {
  const { user }                              = useAuth();
  const [selectedPlan, setSelectedPlan]       = useState<typeof PLANS[0] | null>(null);
  const [step, setStep]                       = useState<"plans" | "paying" | "keys">("plans");
  const [openaiKey, setOpenaiKey]             = useState("");
  const [claudeKey, setClaudeKey]             = useState("");
  const [savingKeys, setSavingKeys]           = useState(false);
  const [keyError, setKeyError]               = useState("");
  const [showOpenai, setShowOpenai]           = useState(false);
  const [showClaude, setShowClaude]           = useState(false);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ESC close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const handleClose = () => {
    setStep("plans");
    setSelectedPlan(null);
    setOpenaiKey("");
    setClaudeKey("");
    setKeyError("");
    onClose();
  };

  // Plan selected
  const handleSelectPlan = (plan: typeof PLANS[0]) => {
    setSelectedPlan(plan);

    // Free plan — just go to key input
    if (!plan.needsPayment) {
      setStep("keys");
      return;
    }

    // Paid plan — open LemonSqueezy checkout
    if (plan.needsPayment) {
      const url = LS_URLS[plan.key];
      if (url && url !== "#" && user) {
        // Append user ID as custom data for webhook
        const checkoutUrl = `${url}?checkout[custom][user_id]=${user.uid}&checkout[email]=${encodeURIComponent(user.email || "")}`;
        window.open(checkoutUrl, "_blank");
        setStep("paying");
      } else {
        // Fallback — show paying state anyway
        setStep("paying");
      }
    }
  };

  // After payment — if plan needs key, go to key step
  const handlePaymentDone = () => {
    if (selectedPlan?.needsKey) {
      setStep("keys");
    } else {
      // Pro+ plans → done!
      onPlanChosen?.(selectedPlan?.key || "");
      handleClose();
    }
  };

  // Save API keys
  const handleSaveKeys = async () => {
    if (!openaiKey.trim() && !claudeKey.trim()) {
      setKeyError("Please enter at least one API key.");
      return;
    }
    if (!user) return;

    setSavingKeys(true);
    setKeyError("");

    try {
      const token = await auth.currentUser?.getIdToken();
      const res   = await fetch("/api/save-keys", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ openaiKey, claudeKey }),
      });

      if (!res.ok) throw new Error("Failed");

      onPlanChosen?.(selectedPlan?.key || "free");
      handleClose();
    } catch {
      setKeyError("Failed to save keys. Please try again.");
    } finally {
      setSavingKeys(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <div
        className="relative z-10 w-full flex flex-col rounded-2xl overflow-hidden"
        style={{
          maxWidth:  "520px",
          maxHeight: "88vh",
          background:"rgba(6,3,3,0.98)",
          border:    "1px solid rgba(255,59,48,0.2)",
          boxShadow: "0 0 60px rgba(255,59,48,0.08), 0 25px 50px rgba(0,0,0,0.6)",
        }}
      >
        {/* Top line */}
        <div className="h-px w-full shrink-0" style={{ background: "linear-gradient(to right,transparent,#FF3B30,transparent)" }} />

        {/* ── STEP: PLANS ── */}
        {step === "plans" && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
              <div>
                <h2 className="text-white font-black text-base leading-none">Choose Your Plan</h2>
                <p className="text-gray-500 text-xs mt-1">Scroll to see all 6 plans · Cancel anytime</p>
              </div>
              <div className="flex items-center gap-3 mr-3">
                {[{ label: "Basic", color: "#6b7280" }, { label: "Pro", color: "#FF3B30" }, { label: "Elite", color: "#a855f7" }].map((t) => (
                  <div key={t.label} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.color, boxShadow: `0 0 4px ${t.color}` }} />
                    <span className="text-xs" style={{ color: t.color }}>{t.label}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center rounded-full border border-white/10 text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Scrollable plans */}
            <div className="overflow-y-auto px-5 py-4 flex-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#FF3B30 transparent" }}>
              {/* Basic */}
              <div className="mb-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500" style={{ boxShadow: "0 0 4px #6b7280" }} />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Basic</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-500/30 to-transparent" />
                </div>
                <div className="flex gap-3">
                  {PLANS.filter((p) => p.tier === "Basic").map((plan) => (
                    <PlanCard key={plan.key} plan={plan} onSelect={handleSelectPlan} currentPlan={currentPlan} />
                  ))}
                </div>
              </div>

              <div className="h-px bg-white/5 my-4" />

              {/* Pro */}
              <div className="mb-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" style={{ boxShadow: "0 0 4px #FF3B30" }} />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#FF3B30]">Pro</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#FF3B30]/30 to-transparent" />
                </div>
                <div className="flex gap-3">
                  {PLANS.filter((p) => p.tier === "Pro").map((plan) => (
                    <PlanCard key={plan.key} plan={plan} onSelect={handleSelectPlan} currentPlan={currentPlan} />
                  ))}
                </div>
              </div>

              <div className="h-px bg-white/5 my-4" />

              {/* Elite */}
              <div className="mb-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" style={{ boxShadow: "0 0 4px #a855f7" }} />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#a855f7]">Elite</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#a855f7]/30 to-transparent" />
                </div>
                <div className="flex gap-3">
                  {PLANS.filter((p) => p.tier === "Elite").map((plan) => (
                    <PlanCard key={plan.key} plan={plan} onSelect={handleSelectPlan} currentPlan={currentPlan} />
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between shrink-0">
              <p className="text-gray-700 text-xs">7-day free trial on paid plans</p>
              <a href="mailto:hello@vnus.ai" className="text-xs text-[#FF3B30] hover:underline">Custom plan?</a>
            </div>
          </>
        )}

        {/* ── STEP: PAYING ── */}
        {step === "paying" && (
          <div className="flex flex-col items-center justify-center p-8 gap-6 flex-1">
            <div className="w-16 h-16 rounded-2xl border border-[#FF3B30]/20 bg-[#FF3B30]/8 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-white font-black text-lg mb-2">Complete Payment</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                A checkout window opened. Complete payment there, then click the button below.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button
                onClick={handlePaymentDone}
                className="w-full py-3 rounded-xl text-white font-bold text-sm"
                style={{ background: "linear-gradient(135deg,#FF3B30,#CC1A10)" }}
              >
                I've Completed Payment →
              </button>
              <button
                onClick={() => setStep("plans")}
                className="w-full py-2.5 rounded-xl text-gray-500 text-sm border border-white/10 hover:text-white transition-colors"
              >
                Back to Plans
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: API KEYS ── */}
        {step === "keys" && (
          <div className="flex flex-col p-6 gap-5 flex-1">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep("plans")} className="text-gray-500 hover:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <div>
                <h3 className="text-white font-black text-base leading-none">Add Your API Keys</h3>
                <p className="text-gray-500 text-xs mt-0.5">
                  {selectedPlan?.name} plan · Keys are encrypted and stored securely
                </p>
              </div>
              <button onClick={handleClose} className="ml-auto w-7 h-7 flex items-center justify-center rounded-full border border-white/10 text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Info box */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-yellow-400/6 border border-yellow-400/15">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" className="shrink-0 mt-0.5">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
              <p className="text-yellow-400/80 text-xs leading-relaxed">
                Your keys are encrypted with AES-256 before saving. We never store or use them for anything other than running your agent commands.
              </p>
            </div>

            {/* OpenAI Key */}
            <div>
              <label className="text-gray-400 text-xs font-semibold mb-1.5 block">OpenAI API Key</label>
              <div className="relative">
                <input
                  type={showOpenai ? "text" : "password"}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/40 transition-all font-mono"
                />
                <button type="button" onClick={() => setShowOpenai(!showOpenai)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showOpenai
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 text-xs mt-1">Get it from platform.openai.com/api-keys</p>
            </div>

            {/* Claude Key */}
            <div>
              <label className="text-gray-400 text-xs font-semibold mb-1.5 block">Anthropic (Claude) API Key</label>
              <div className="relative">
                <input
                  type={showClaude ? "text" : "password"}
                  value={claudeKey}
                  onChange={(e) => setClaudeKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/40 transition-all font-mono"
                />
                <button type="button" onClick={() => setShowClaude(!showClaude)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showClaude
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 text-xs mt-1">Get it from console.anthropic.com/settings/keys</p>
            </div>

            {keyError && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-red-400 text-xs">{keyError}</p>
              </div>
            )}

            <button
              onClick={handleSaveKeys}
              disabled={savingKeys || (!openaiKey.trim() && !claudeKey.trim())}
              className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#FF3B30,#CC1A10)" }}
            >
              {savingKeys
                ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>Saving securely...</>
                : <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                    </svg>
                    Save Keys &amp; Activate
                  </>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}