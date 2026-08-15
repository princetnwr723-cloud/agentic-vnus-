"use client";
import { useEffect, useRef, useState } from "react";

/* ── Animated mini-demos ── */

function BusinessDNADemo() {
  const roles = [
    { key: "CEO", icon: "👑", color: "#FF3B30" },
    { key: "CMO", icon: "📢", color: "#f97316" },
    { key: "CTO", icon: "💻", color: "#60a5fa" },
    { key: "CFO", icon: "💰", color: "#4ade80" },
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
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-500"
          style={{ background: `${r.color}18`, border: `1px solid ${r.color}35` }}
        >
          {r.icon}
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
            <span className="text-sm">{role.icon}</span>
            <span className="text-[9px] text-gray-500">{role.key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MultiAgentDemo() {
  const agents = [
    { name: "Research", icon: "🔍" },
    { name: "Strategy", icon: "🎯" },
    { name: "Marketing", icon: "📢" },
    { name: "Write", icon: "✍️" },
    { name: "Edit", icon: "✅" },
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
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm border transition-all duration-300"
              style={{
                borderColor: i < litUpTo ? "rgba(255,59,48,0.5)" : "rgba(255,255,255,0.08)",
                background: i < litUpTo ? "rgba(255,59,48,0.12)" : "rgba(255,255,255,0.02)",
                boxShadow: i < litUpTo ? "0 0 12px rgba(255,59,48,0.25)" : "none",
              }}
            >
              {a.icon}
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
    { icon: "⚠️", text: "Competitor dropped pricing 15%", color: "#fbbf24" },
    { icon: "💡", text: "3 new leads match your ICP", color: "#4ade80" },
    { icon: "📈", text: "MRR up 12% this week", color: "#60a5fa" },
  ];
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => (c + 1) % (alerts.length + 1)), 1200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="glass-card rounded-2xl p-6 w-full max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">☀️</span>
        <span className="text-white font-bold text-sm">Morning Brief — 9:00 AM</span>
      </div>
      <div className="space-y-2 min-h-[104px]">
        {alerts.slice(0, count).map((a) => (
          <div
            key={a.text}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs text-gray-300"
            style={{ borderColor: `${a.color}25`, background: `${a.color}08`, animation: "slideUp 0.4s ease forwards" }}
          >
            <span>{a.icon}</span>
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
    tag: "🧬 Business DNA",
    title: "Your agent becomes your AI executive",
    desc: "Introduce your business once — 20 questions, 5 minutes. Vnus remembers everything forever and works as your dedicated CEO, CMO, CTO, or CFO. No other agent in the world does this.",
    demo: <BusinessDNADemo />,
  },
  {
    tag: "👥 Multi-Agent Teams",
    title: "Complex tasks assemble a full team",
    desc: "A Boss Agent detects complex work and builds the right team automatically — Research, Strategy, Marketing, Writer, Editor. Each agent builds on the last one's output, 5x faster than one agent alone.",
    demo: <MultiAgentDemo />,
  },
  {
    tag: "☀️ Proactive AI",
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
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
                style={{ background: "rgba(255,59,48,0.1)", color: "#FF3B30", border: "1px solid rgba(255,59,48,0.2)" }}>
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
