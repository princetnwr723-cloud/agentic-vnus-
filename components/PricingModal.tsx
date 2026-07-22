"use client";
import { useEffect, useState, useRef } from "react";

// ── Plan data — app ke hisaab se ──────────────────────────
const PLANS = [
  {
    key:      "free",
    name:     "Free",
    price:    0,
    color:    "#6b7280",
    tagline:  "Start with local AI",
    features: [
      "50 tasks / month",
      "1 PC workspace connected",
      "Runs on your RAM — we pick the best model that fits (e.g. Qwen 3.5 2B on 4GB RAM, Qwen 3.5 9B on 16GB)",
      "50% RAM rule: model always uses ≤ half your RAM so your PC stays smooth",
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
    features: [
      "250 tasks / month",
      "2 PC workspaces",
      "Better models unlocked — Phi-4 Mini, DeepSeek R1 8B on 8GB RAM",
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
      "500 tasks / month",
      "5 PC workspaces",
      "Qwen 3 30B MoE unlocked on 32GB RAM — 30B quality at 3B speed",
      "50% RAM rule: on 16GB you get Qwen 3.5 14B, on 32GB the MoE kicks in",
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
    features: [
      "1,250 tasks / month",
      "10 PC workspaces",
      "Qwen 3 Coder 30B + DeepSeek R1 32B on 32GB+ RAM",
      "50% RAM rule: on 64GB Llama 3.3 70B becomes available",
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
      "5,000 tasks / month",
      "Unlimited PC workspaces",
      "Llama 3.3 70B Q4 on 64GB RAM — matches GPT-4 Turbo quality",
      "50% RAM rule: on 128GB systems the full Q8 model runs",
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
      "10,000 tasks / month — effectively unlimited",
      "Unlimited workspaces + unlimited team seats",
      "Llama 3.1 405B Q2 on 128GB+ RAM — world-class local model",
      "50% RAM rule: 405B needs ~112GB free so it's 128GB+ machines only",
      "White-label branding, custom AI fine-tuning, custom SLA",
      "Dedicated account manager + onboarding call",
    ],
  },
];

// ── Types ─────────────────────────────────────────────────
export interface PricingModalProps {
  isOpen:        boolean;
  onClose:       () => void;
  currentPlan?:  string;
  onPlanChosen?: (planKey: string) => void;
}

// ── Arrow button ───────────────────────────────────────────
function Arrow({
  dir,
  onClick,
  disabled,
  color,
}: {
  dir: "left" | "right";
  onClick: () => void;
  disabled: boolean;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? "Previous plan" : "Next plan"}
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: `1.5px solid ${disabled ? "rgba(255,255,255,0.08)" : color + "55"}`,
        background: disabled ? "rgba(255,255,255,0.03)" : `${color}15`,
        color: disabled ? "#333" : color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.25s ease",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.background = `${color}30`;
          (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}88`;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.background = `${color}15`;
          (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}55`;
        }
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        {dir === "left" ? (
          <path d="M15 18l-6-6 6-6" />
        ) : (
          <path d="M9 18l6-6-6-6" />
        )}
      </svg>
    </button>
  );
}

// ── Dot indicator ──────────────────────────────────────────
function Dots({
  total,
  active,
  onDotClick,
}: {
  total: number;
  active: number;
  onDotClick: (i: number) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          aria-label={`Go to plan ${i + 1}`}
          style={{
            width: i === active ? 20 : 6,
            height: 6,
            borderRadius: 3,
            border: "none",
            background:
              i === active
                ? PLANS[active].color
                : "rgba(255,255,255,0.15)",
            cursor: "pointer",
            padding: 0,
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────
export default function PricingModal({
  isOpen,
  onClose,
  currentPlan = "free",
  onPlanChosen,
}: PricingModalProps) {
  const startIdx = Math.max(
    0,
    PLANS.findIndex((p) => p.key === currentPlan)
  );
  const [idx, setIdx]           = useState(startIdx);
  const [direction, setDir]     = useState<"left" | "right">("right");
  const [animating, setAnim]    = useState(false);
  const timeoutRef              = useRef<ReturnType<typeof setTimeout>>();

  const plan = PLANS[idx];

  // Reset to current plan when modal opens
  useEffect(() => {
    if (isOpen) {
      setIdx(startIdx);
      setAnim(false);
    }
  }, [isOpen, startIdx]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go("right");
      if (e.key === "ArrowLeft")  go("left");
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
    }, 320);
  };

  const goTo = (i: number) => {
    if (animating || i === idx) return;
    setDir(i > idx ? "right" : "left");
    setAnim(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIdx(i);
      setAnim(false);
    }, 320);
  };

  if (!isOpen) return null;

  const isCurrent = plan.key === currentPlan;
  const c = plan.color;

  // Slide animation values
  const slideOut = direction === "right" ? "-60px" : "60px";
  const cardStyle: React.CSSProperties = {
    transform:  animating ? `translateX(${slideOut}) scale(0.94)` : "translateX(0) scale(1)",
    opacity:    animating ? 0 : 1,
    transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.32s ease",
  };

  return (
    <>
      {/* ── Keyframes injected once ── */}
      <style>{`
        @keyframes pmFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pmSlideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        style={{
          position:        "fixed",
          inset:           0,
          zIndex:          300,
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          padding:         "16px",
          background:      "rgba(0,0,0,0.82)",
          backdropFilter:  "blur(10px)",
          animation:       "pmFadeIn 0.22s ease",
        }}
      >
        {/* Modal shell */}
        <div
          style={{
            position:     "relative",
            width:        "100%",
            maxWidth:     460,
            borderRadius: 22,
            border:       `1px solid ${c}35`,
            background:   "rgba(7,3,3,0.98)",
            boxShadow:    `0 0 50px ${c}12, 0 30px 60px rgba(0,0,0,0.6)`,
            overflow:     "hidden",
            animation:    "pmSlideUp 0.28s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {/* Top color line */}
          <div style={{
            height:     "2px",
            background: `linear-gradient(to right, transparent, ${c}, transparent)`,
            transition: "background 0.4s ease",
          }} />

          {/* Header */}
          <div style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            padding:        "18px 20px 14px",
            borderBottom:   "1px solid rgba(255,255,255,0.05)",
          }}>
            <div>
              <p style={{ color: "#fff", fontWeight: 800, fontSize: 15, margin: 0 }}>
                Choose Plan
              </p>
              <p style={{ color: "#555", fontSize: 11, margin: "2px 0 0", letterSpacing: "0.03em" }}>
                Use arrow keys or swipe to browse
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width:        28,
                height:       28,
                borderRadius: "50%",
                border:       "1px solid rgba(255,255,255,0.08)",
                background:   "rgba(255,255,255,0.04)",
                color:        "#555",
                cursor:       "pointer",
                display:      "flex",
                alignItems:   "center",
                justifyContent: "center",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Slider row */}
          <div style={{
            display:    "flex",
            alignItems: "center",
            gap:        14,
            padding:    "20px 18px 0",
          }}>
            <Arrow
              dir="left"
              onClick={() => go("left")}
              disabled={idx === 0 || animating}
              color={c}
            />

            {/* Plan card — animates */}
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={cardStyle}>

                {/* Plan name + price */}
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  {plan.badge && (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{
                        fontSize:    10,
                        fontWeight:  700,
                        padding:     "3px 10px",
                        borderRadius: 20,
                        background:  `${c}18`,
                        color:       c,
                        border:      `1px solid ${c}35`,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}>
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  <p style={{
                    fontSize:   28,
                    fontWeight: 900,
                    color:      "#fff",
                    margin:     0,
                    lineHeight: 1,
                  }}>
                    {plan.name}
                  </p>
                  <p style={{
                    fontSize:    13,
                    color:       c,
                    margin:      "5px 0 0",
                    fontWeight:  600,
                    opacity:     0.85,
                  }}>
                    {plan.tagline}
                  </p>
                  <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4 }}>
                    <span style={{ fontSize: 38, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                      {plan.price === 0 ? "Free" : `$${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>/mo</span>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div style={{
                  height:     "1px",
                  background: `linear-gradient(to right, transparent, ${c}40, transparent)`,
                  margin:     "0 0 14px",
                }} />

                {/* Features — 6 lines */}
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                      <span style={{
                        width:        16,
                        height:       16,
                        borderRadius: "50%",
                        background:   `${c}18`,
                        border:       `1px solid ${c}40`,
                        display:      "flex",
                        alignItems:   "center",
                        justifyContent: "center",
                        flexShrink:   0,
                        marginTop:    "1px",
                      }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none"
                          stroke={c} strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </span>
                      <span style={{ fontSize: 12.5, color: "#bbb", lineHeight: 1.5 }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Status badge if current */}
                {isCurrent && (
                  <div style={{
                    marginTop:    16,
                    padding:      "8px 12px",
                    borderRadius: 10,
                    background:   "rgba(74,222,128,0.08)",
                    border:       "1px solid rgba(74,222,128,0.2)",
                    textAlign:    "center",
                  }}>
                    <span style={{ color: "#4ade80", fontSize: 12, fontWeight: 700 }}>
                      ✓ Your current plan
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Arrow
              dir="right"
              onClick={() => go("right")}
              disabled={idx === PLANS.length - 1 || animating}
              color={c}
            />
          </div>

          {/* Dot nav + plan counter */}
          <div style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            padding:        "16px 24px 20px",
          }}>
            <Dots total={PLANS.length} active={idx} onDotClick={goTo} />
            <span style={{ fontSize: 11, color: "#444", fontWeight: 600 }}>
              {idx + 1} / {PLANS.length}
            </span>
          </div>

          {/* Bottom glow line */}
          <div style={{
            height:     "1px",
            background: `linear-gradient(to right, transparent, ${c}25, transparent)`,
            transition: "background 0.4s ease",
          }} />

          {/* Footer note */}
          <div style={{ padding: "10px 20px 14px", textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "#383838", margin: 0 }}>
              All plans · Local AI on your PC · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </>
  );
}