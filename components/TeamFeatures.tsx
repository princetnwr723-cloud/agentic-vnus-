"use client";
import { useEffect, useRef, useState } from "react";

/* ── SVG icon set (replaces emojis) ── */

const ICON_PATHS: Record<string, JSX.Element> = {
  crown:    <path d="M3 8l4 3 5-6 5 6 4-3-2 11H5L3 8z"/>,
  megaphone:<><path d="M3 11v2a2 2 0 002 2h1l3 5V6l-3 5H5a2 2 0 00-2 2z"/><path d="M14 8a4 4 0 010 8M17 5a8 8 0 010 14"/></>,
  code:     <><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>,
  coin:     <><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9.5c0-1.4 1.3-2.5 3-2.5s3 1.1 3 2.5-1.3 2-3 2.5-3 1.1-3 2.5 1.3 2.5 3 2.5 3-1.1 3-2.5"/></>,
  search:   <><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  target:   <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none"/></>,
  pencil:   <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></>,
  check:    <polyline points="20 6 9 17 4 12"/>,
  warning:  <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  bulb:     <><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.5.4.8 1 .8 1.7V17h6.4v-.6c0-.7.3-1.3.8-1.7A7 7 0 0012 2z"/></>,
  chart:    <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  sun:      <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  dna:      <path d="M6 3c0 6 12 6 12 12M6 21c0-6 12-6 12-12M8 6h8M8 18h8"/>,
  team:     <><circle cx="9" cy="7" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M2 21v-1a6 6 0 016-6h2a6 6 0 016 6v1M16 14.2a4.6 4.6 0 014 4.3V21"/></>,
};

function Icon({ name, size = 16 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {ICON_PATHS[name]}
    </svg>
  );
}

/* ── Animated mini-demos ── */

function BusinessDNADemo() {
  const roles = [
    { key: "CEO", icon: "crown",     color: "#FF3B30" },
    { key: "CMO", icon: "megaphone", color: "#f97316" },
    { key: "CTO", icon: "code",      color: "#60a5fa" },
    { key: "CFO", icon: "coin",      color: "#4ade80" },
  ];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % roles.length), 1600);
    return () => clearInterval(id);
  }, []);
  const r = roles[active];
  return (
    <div className="glass-card rounded-2xl p-6 w-full max-w-sm mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500"
          style={{ background: `${r.color}18`, border: `1px solid ${r.color}35`, color: r.color }}
        >
          <Icon name={r.icon} size={22} />
        </div>
        <div>
          <div className="text-white font-bold text-sm">Vnus</div>
          <div className="text-xs transition-colors duration-500" style={{ color: r.color }}>
            AI {r.key} of your business
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {roles.map((role, i) => (
          <div
            key={role.key}
            className="flex flex-col items-center gap-1 py-2.5 rounded-lg border transition-all duration-300"
            style={{
              borderColor: i === active ? `${role.color}50` : "rgba(255,255,255,0.06)",
              background: i === active ? `${role.color}10` : "rgba(255,255,255,0.02)",
            }}
          >
            <span style={{ color: i === active ? role.color : "#666" }}><Icon name={role.icon} size={14} /></span>
            <span className="text-[9px] text-gray-500">{role.key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MultiAgentDemo() {
  const agents = [
    { name: "Research", icon: "search" },
    { name: "Strategy", icon: "target" },
    { name: "Marketing", icon: "megaphone" },
    { name: "Write", icon: "pencil" },
    { name: "Edit", icon: "check" },
  ];
  const [litUpTo, setLitUpTo] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setLitUpTo((n) => (n + 1) % (agents.length + 1)), 700);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="glass-card rounded-2xl p-6 w-full max-w-sm mx-auto">
      <div className="text-xs text-gray-500 mb-4">Team assembled for: <span className="text-white font-semibold">"Launch campaign"</span></div>
      <div className="flex items-center justify-between">
        {agents.map((a, i) => (
          <div key={a.name} className="flex flex-col items-center gap-1.5 relative">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300"
              style={{
                borderColor: i < litUpTo ? "rgba(255,59,48,0.5)" : "rgba(255,255,255,0.08)",
                background: i < litUpTo ? "rgba(255,59,48,0.12)" : "rgba(255,255,255,0.02)",
                boxShadow: i < litUpTo ? "0 0 12px rgba(255,59,48,0.25)" : "none",
                color: i < litUpTo ? "#FF3B30" : "#666",
              }}
            >
              <Icon name={a.icon} size={15} />
            </div>
            <span className="text-[9px] text-gray-600">{a.name}</span>
            {i < agents.length - 1 && (
              <div
                className="absolute top-4.5 left-9 w-4 h-px"
                style={{ background: i < litUpTo - 1 ? "#FF3B30" : "rgba(255,255,255,0.1)", transition: "background .3s" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProactiveDemo() {
  const alerts = [
    { icon: "warning", text: "Competitor dropped pricing 15%", color: "#fbbf24" },
    { icon: "bulb",    text: "3 new leads match your ICP",     color: "#4ade80" },
    { icon: "chart",   text: "MRR up 12% this week",            color: "#60a5fa" },
  ];
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => (c + 1) % (alerts.length + 1)), 1200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="glass-card rounded-2xl p-6 w-full max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#fbbf24]"><Icon name="sun" size={18} /></span>
        <span className="text-white font-bold text-sm">Morning Brief — 9:00 AM</span>
      </div>
      <div className="space-y-2 min-h-[104px]">
        {alerts.slice(0, count).map((a) => (
          <div
            key={a.text}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs text-gray-300"
            style={{ borderColor: `${a.color}25`, background: `${a.color}08`, animation: "slideUp 0.4s ease forwards" }}
          >
            <span style={{ color: a.color }}><Icon name={a.icon} size={13} /></span>
            {a.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Section content ── */

const FEATURES = [
  {
    tagIcon: "dna",
    tag: "Business DNA",
    title: "Your agent becomes your AI executive",
    desc: "Introduce your business once — 20 questions, 5 minutes. Vnus remembers everything forever and works as your dedicated CEO, CMO, CTO, or CFO. No other agent in the world does this.",
    demo: <BusinessDNADemo />,
  },
  {
    tagIcon: "team",
    tag: "Multi-Agent Teams",
    title: "Complex tasks assemble a full team",
    desc: "A Boss Agent detects complex work and builds the right team automatically — Research, Strategy, Marketing, Writer, Editor. Each agent builds on the last one's output, 5x faster than one agent alone.",
    demo: <MultiAgentDemo />,
  },
  {
    tagIcon: "sun",
    tag: "Proactive AI",
    title: "Works even when you don't ask",
    desc: "Morning briefings at 9am, opportunity scans every 6 hours, weekly reports every Monday. Vnus monitors your market and surfaces what matters — before you have to look for it.",
    demo: <ProactiveDemo />,
  },
];

export default function TeamFeatures() {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = rowRefs.current.map((row) => {
      if (!row) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) row.classList.add("visible"); },
        { threshold: 0.15 }
      );
      obs.observe(row);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <section id="business-features" className="relative z-10 max-w-6xl mx-auto px-6 py-20">
      <div className="section-marker">Built For Business</div>
      <p className="text-gray-500 text-base mb-16 max-w-xl">
        Features no other local AI agent has — set up once, works for your business forever.
      </p>

      <div className="flex flex-col gap-20">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            ref={(el) => { rowRefs.current[i] = el; }}
            className="reveal grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
          >
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-4"
                style={{ background: "rgba(255,59,48,0.1)", color: "#FF3B30", border: "1px solid rgba(255,59,48,0.2)" }}>
                <Icon name={f.tagIcon} size={13} />
                {f.tag}
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">{f.title}</h3>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md">{f.desc}</p>
            </div>
            <div className={i % 2 === 1 ? "md:order-1" : ""}>{f.demo}</div>
          </div>
        ))}
      </div>
    </section>
  );
}