"use client";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";

// ── Gumroad URLs — .env.local me set karo ────────────────
// Agar env nahi hai to # placeholder use hoga
const GUMROAD_URLS: Record<string, string> = {
  free:        "",
  starter:     process.env.NEXT_PUBLIC_GUMROAD_URL_STARTER     || "#",
  pro:         process.env.NEXT_PUBLIC_GUMROAD_URL_PRO         || "#",
  pro_max:     process.env.NEXT_PUBLIC_GUMROAD_URL_PRO_MAX     || "#",
  elite:       process.env.NEXT_PUBLIC_GUMROAD_URL_ELITE       || "#",
  elite_ultra: process.env.NEXT_PUBLIC_GUMROAD_URL_ELITE_ULTRA || "#",
};

// ── Plan data ─────────────────────────────────────────────
const PLANS = [
  {
    key:      "free",
    name:     "Free",
    price:    0,
    color:    "#6b7280",
    tagline:  "Start with local AI",
    badge:    null as string | null,
    features: [
      "2.5 Million tokens/daily",
      "1 PC workspace connected",
      "Best model auto-picked for your RAM — e.g. Qwen 3.5 2B on 4GB, Qwen 3.5 9B on 16GB",
      "50% RAM rule: model always uses ≤ half your RAM so PC stays smooth",
      "General commands only (open apps, files, browser)",
      "Community support",
    ],
  },
  {
    key:      "starter",
    name:     "Starter",
    price:    5,
    color:    "#60a5fa",
    tagline:  "Bring your own API key",
    badge:    null as string | null,
    features: [
      "5 Million tokens/daily",
      "2 PC workspaces",
      "Better models — Phi-4 Mini, DeepSeek R1 8B on 8GB+",
      "50% RAM rule applies — model auto-selected for your machine",
      "Vision mode ON: agent sees your screen for accurate clicks",
      "All 6 built-in skills (Email, Calendar, Browser, Files, Terminal, GitHub)",
    ],
  },
  {
    key:      "pro",
    name:     "Pro",
    price:    29,
    color:    "#FF3B30",
    tagline:  "No API key needed",
    badge:    "Best Value",
    features: [
      "unlimited",
      "5 PC workspaces",
      "Qwen 3 30B MoE on 32GB RAM — 30B quality at 3B speed",
      "50% RAM rule: 16GB → Qwen 14B, 32GB → MoE kicks in automatically",
      "Vision auto-ON — agent always watches screen before acting",
      "Skill Marketplace access + sell your own skills",
    ],
  },
  {
    key:      "pro_max",
    name:     "Pro Max",
    price:    60,
    color:    "#f97316",
    tagline:  "Power users",
    badge:    null as string | null,
    features: [
      "unlimited",
      "10 PC workspaces",
      "Qwen 3 Coder 30B + DeepSeek R1 32B on 32GB+ RAM",
      "50% RAM rule: 64GB+ unlocks Llama 3.3 70B automatically",
      "Task scheduler — run commands on a timer automatically",
      "Webhook triggers + analytics dashboard",
    ],
  },
  {
    key:      "elite",
    name:     "Elite",
    price:    499,
    color:    "#a855f7",
    tagline:  "Teams & agencies",
    badge:    "Enterprise",
    features: [
      "Unlimited",
      "Unlimited PC workspaces",
      "Llama 3.3 70B Q4 on 64GB — GPT-4 Turbo quality locally",
      "50% RAM rule: 128GB unlocks the full Q8 model",
      "Vision auto-ON across all agents simultaneously",
      "10 team seats, role-based access, 99.9% SLA",
    ],
  },
  {
    key:      "elite_ultra",
    name:     "Elite Ultra",
    price:    999,
    color:    "#ec4899",
    tagline:  "No limits",
    badge:    "Max Power",
    features: [
      "unlimited",
      "Unlimited workspaces + unlimited team seats",
      "Llama 3.1 405B Q2 on 128GB+ RAM — world-class local model",
      "50% RAM rule: 405B needs ~112GB free, 128GB+ machines only",
      "White-label branding, custom fine-tuning, custom SLA",
      "Dedicated account manager + onboarding call",
    ],
  },
];

export interface PricingModalProps {
  isOpen:        boolean;
  onClose:       () => void;
  currentPlan?:  string;
  onPlanChosen?: (planKey: string) => void;
  // showContinue: workspace/splash me true hoga
  showContinue?: boolean;
}

export default function PricingModal({
  isOpen,
  onClose,
  currentPlan  = "free",
  onPlanChosen,
  showContinue = false,
}: PricingModalProps) {
  const { user } = useAuth();

  const startIdx = Math.max(0, PLANS.findIndex((p) => p.key === currentPlan));
  const [idx,       setIdx]   = useState(startIdx);
  const [direction, setDir]   = useState<"left" | "right">("right");
  const [animating, setAnim]  = useState(false);
  const timeoutRef            = useRef<ReturnType<typeof setTimeout>>();

  const plan = PLANS[idx];

  useEffect(() => {
    if (isOpen) { setIdx(startIdx); setAnim(false); }
  }, [isOpen, startIdx]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowRight")  go("right");
      if (e.key === "ArrowLeft")   go("left");
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [idx, animating]);

  const go = (dir: "left" | "right") => {
    if (animating) return;
    const next = dir === "right" ? idx + 1 : idx - 1;
    if (next < 0 || next >= PLANS.length) return;
    setDir(dir);
    setAnim(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIdx(next);
      setAnim(false);
    }, 300);
  };

  const goTo = (i: number) => {
    if (animating || i === idx) return;
    setDir(i > idx ? "right" : "left");
    setAnim(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIdx(i);
      setAnim(false);
    }, 300);
  };

  // ── Continue / Get Plan button handle ────────────────────
  const handleContinue = () => {
    if (plan.key === "free") {
      // Free plan — seedha activate
      onPlanChosen?.(plan.key);
      onClose();
      return;
    }

    // Gumroad checkout URL banao with user_id
    const baseUrl = GUMROAD_URLS[plan.key];
    if (!baseUrl || baseUrl === "#") {
      alert("Payment link coming soon!");
      return;
    }

    const uid       = user?.uid || "";
    const email     = user?.email || "";
    const checkoutUrl = `${baseUrl}?wanted=true&user_id=${uid}&email=${encodeURIComponent(email)}`;

    window.open(checkoutUrl, "_blank");

    // Payment window open hone ke baad onPlanChosen call karo
    // Real plan update Gumroad webhook se Firebase me hoga
    onPlanChosen?.(plan.key);
  };

  if (!isOpen) return null;

  const isCurrent = plan.key === currentPlan;
  const c         = plan.color;

  // Slide animation
  const slideOut = direction === "right" ? "-55px" : "55px";
  const cardStyle: React.CSSProperties = {
    transform:  animating ? `translateX(${slideOut}) scale(0.93)` : "translateX(0) scale(1)",
    opacity:    animating ? 0 : 1,
    transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease",
    willChange: "transform, opacity",
  };

  return (
    <>
      <style>{`
        @keyframes pm-in {
          from { opacity:0; transform:translateY(20px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        style={{
          position:       "fixed",
          inset:          0,
          zIndex:         300,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "16px",
          background:     "rgba(0,0,0,0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Modal */}
        <div style={{
          position:     "relative",
          width:        "100%",
          maxWidth:     440,
          borderRadius: 22,
          border:       `1px solid ${c}30`,
          background:   "rgba(7,3,3,0.98)",
          boxShadow:    `0 0 40px ${c}10, 0 30px 60px rgba(0,0,0,0.7)`,
          overflow:     "hidden",
          animation:    "pm-in 0.28s cubic-bezier(0.4,0,0.2,1)",
          transition:   "border-color 0.4s ease, box-shadow 0.4s ease",
        }}>

          {/* Top color line */}
          <div style={{
            height:     2,
            background: `linear-gradient(to right, transparent, ${c}, transparent)`,
            transition: "background 0.4s ease",
          }} />

          {/* Header */}
          <div style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            padding:        "16px 18px 12px",
            borderBottom:   "1px solid rgba(255,255,255,0.05)",
          }}>
            <div>
              <p style={{ color:"#fff", fontWeight:800, fontSize:14, margin:0 }}>Choose Plan</p>
              <p style={{ color:"#444", fontSize:11, margin:"2px 0 0" }}>Arrow keys ← → to browse</p>
            </div>
            <button onClick={onClose} style={{
              width:26, height:26, borderRadius:"50%",
              border:"1px solid rgba(255,255,255,0.08)",
              background:"rgba(255,255,255,0.04)",
              color:"#555", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Slider row */}
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"18px 14px 0" }}>

            {/* Left arrow */}
            <button
              onClick={() => go("left")}
              disabled={idx === 0 || animating}
              style={{
                width:38, height:38, borderRadius:"50%", flexShrink:0,
                border:`1.5px solid ${idx === 0 ? "rgba(255,255,255,0.07)" : c + "50"}`,
                background: idx === 0 ? "rgba(255,255,255,0.02)" : `${c}12`,
                color: idx === 0 ? "#2a2a2a" : c,
                cursor: idx === 0 ? "not-allowed" : "pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.2s ease",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>

            {/* Card */}
            <div style={{ flex:1, overflow:"hidden" }}>
              <div style={cardStyle}>

                {/* Badge + Name + Price */}
                <div style={{ textAlign:"center", marginBottom:14 }}>
                  {plan.badge && (
                    <div style={{ marginBottom:7 }}>
                      <span style={{
                        fontSize:9, fontWeight:700,
                        padding:"2px 10px", borderRadius:20,
                        background:`${c}18`, color:c,
                        border:`1px solid ${c}30`,
                        letterSpacing:"0.08em", textTransform:"uppercase",
                      }}>
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  <p style={{ fontSize:26, fontWeight:900, color:"#fff", margin:0, lineHeight:1 }}>
                    {plan.name}
                  </p>
                  <p style={{ fontSize:12, color:c, margin:"4px 0 0", fontWeight:600, opacity:0.85 }}>
                    {plan.tagline}
                  </p>
                  <div style={{
                    display:"flex", alignItems:"baseline",
                    justifyContent:"center", gap:3, marginTop:8,
                  }}>
                    <span style={{ fontSize:34, fontWeight:900, color:"#fff", lineHeight:1 }}>
                      {plan.price === 0 ? "Free" : `$${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span style={{ fontSize:12, color:"#444" }}>/mo</span>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div style={{
                  height:1, margin:"0 0 13px",
                  background:`linear-gradient(to right, transparent, ${c}40, transparent)`,
                  transition:"background 0.4s ease",
                }} />

                {/* Features */}
                <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:8 }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                      <span style={{
                        width:15, height:15, borderRadius:"50%", flexShrink:0, marginTop:1,
                        background:`${c}15`, border:`1px solid ${c}38`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}>
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="none"
                          stroke={c} strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </span>
                      <span style={{ fontSize:12, color:"#bbb", lineHeight:1.55 }}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Current plan badge */}
                {isCurrent && (
                  <div style={{
                    marginTop:14, padding:"7px 10px", borderRadius:9, textAlign:"center",
                    background:"rgba(74,222,128,0.07)", border:"1px solid rgba(74,222,128,0.2)",
                  }}>
                    <span style={{ color:"#4ade80", fontSize:11, fontWeight:700 }}>
                      ✓ Your current plan
                    </span>
                  </div>
                )}

                {/* Continue / Get Plan button — sirf showContinue=true pe */}
                {showContinue && !isCurrent && (
                  <button
                    onClick={handleContinue}
                    style={{
                      width:"100%", marginTop:14, padding:"11px 0",
                      borderRadius:12, border:"none", cursor:"pointer",
                      fontSize:13, fontWeight:700, color:"#fff",
                      background:`linear-gradient(135deg, ${c}, ${c}cc)`,
                      boxShadow:`0 4px 16px ${c}30`,
                      transition:"all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 20px ${c}45`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 16px ${c}30`;
                    }}
                  >
                    {plan.price === 0
                      ? "Continue with Free →"
                      : `Get ${plan.name} — $${plan.price}/mo →`}
                  </button>
                )}
              </div>
            </div>

            {/* Right arrow */}
            <button
              onClick={() => go("right")}
              disabled={idx === PLANS.length - 1 || animating}
              style={{
                width:38, height:38, borderRadius:"50%", flexShrink:0,
                border:`1.5px solid ${idx === PLANS.length-1 ? "rgba(255,255,255,0.07)" : c+"50"}`,
                background: idx === PLANS.length-1 ? "rgba(255,255,255,0.02)" : `${c}12`,
                color: idx === PLANS.length-1 ? "#2a2a2a" : c,
                cursor: idx === PLANS.length-1 ? "not-allowed" : "pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.2s ease",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>

          {/* Dots + counter */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"14px 20px 16px",
          }}>
            <div style={{ display:"flex", gap:5, alignItems:"center" }}>
              {PLANS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    height:6, borderRadius:3, border:"none", padding:0, cursor:"pointer",
                    width: i === idx ? 18 : 6,
                    background: i === idx ? PLANS[idx].color : "rgba(255,255,255,0.15)",
                    transition:"all 0.3s ease",
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize:11, color:"#383838", fontWeight:600 }}>
              {idx + 1} / {PLANS.length}
            </span>
          </div>

          {/* Bottom line */}
          <div style={{
            height:1,
            background:`linear-gradient(to right, transparent, ${c}20, transparent)`,
          }} />
          <div style={{ padding:"8px 18px 12px", textAlign:"center" }}>
            <p style={{ fontSize:11, color:"#2e2e2e", margin:0 }}>
              Local AI on your PC · Cancel anytime · Monthly billing
            </p>
          </div>
        </div>
      </div>
    </>
  );
}