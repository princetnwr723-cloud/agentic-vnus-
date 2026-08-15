"use client";
import { useEffect, useRef } from "react";

function ChatMockup() {
  return (
    <div className="glass-card rounded-2xl p-5 w-full max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-xs text-gray-600 font-mono">vnus — clear inbox</span>
      </div>
      <div className="flex justify-end mb-3">
        <div className="bg-[#FF3B30]/15 border border-[#FF3B30]/25 text-white text-xs px-3 py-2 rounded-xl rounded-tr-sm max-w-[80%]">
          Clear my inbox and reply to anything urgent
        </div>
      </div>
      <div className="flex justify-start">
        <div className="bg-white/5 border border-white/8 text-gray-300 text-xs px-3 py-2 rounded-xl rounded-tl-sm max-w-[85%] flex items-center gap-1">
          On it — drafting 4 replies
          <span className="w-1 h-3 bg-white/60 inline-block" style={{ animation: "starTwinkle 1s step-end infinite" }} />
        </div>
      </div>
    </div>
  );
}

function ParallelAgentsMockup() {
  const rows = [
    { label: "Email Agent", w: "78%" },
    { label: "Calendar Agent", w: "52%" },
    { label: "Browser Agent", w: "91%" },
  ];
  return (
    <div className="glass-card rounded-2xl p-5 w-full max-w-sm mx-auto space-y-3.5">
      {rows.map((r, i) => (
        <div key={r.label}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-400">{r.label}</span>
            <span className="text-xs text-gray-600">running</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: r.w,
                background: "linear-gradient(90deg,#FF3B30,#ff8a80)",
                animation: `pulseGlow 2.2s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ConnectorsMockup() {
  const apps = ["Gmail", "Calendar", "GitHub", "Notion", "Chrome", "Slack"];
  return (
    <div className="glass-card rounded-2xl p-5 w-full max-w-sm mx-auto">
      <div className="grid grid-cols-3 gap-2.5">
        {apps.map((app, i) => (
          <div
            key={app}
            className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border border-white/8 bg-white/[0.02]"
            style={{ animation: `fadeIn .6s ease ${i * 0.12}s both` }}
          >
            <div className="w-6 h-6 rounded-md bg-[#FF3B30]/10 border border-[#FF3B30]/20" />
            <span className="text-[10px] text-gray-500">{app}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MemoryMockup() {
  const facts = ["Only signs annual contracts", "Dana approves final pricing", "Prefers async follow-ups"];
  return (
    <div className="glass-card rounded-2xl p-5 w-full max-w-sm mx-auto">
      <div className="text-xs text-gray-500 mb-3">
        Updated memory for <span className="text-white font-semibold">Account Manager</span>
      </div>
      <div className="space-y-2">
        {facts.map((f, i) => (
          <div
            key={f}
            className="flex items-center gap-2 text-xs text-gray-300 bg-white/[0.02] border border-white/8 rounded-lg px-3 py-2"
            style={{ animation: `fadeIn .5s ease ${i * 0.15}s both` }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}

const STORIES = [
  {
    eyebrow: "Talk to it like a teammate",
    title: "Message Vnus like a teammate",
    desc: "Give it a task on desktop, WhatsApp, or Telegram. It takes the project start to finish and comes back only when your approval is needed.",
    mockup: <ChatMockup />,
  },
  {
    eyebrow: "Parallel execution",
    title: "Run many skills at once",
    desc: "Spin up Email, Calendar, and Browser agents in parallel. They work 24/7 in the background without waiting on each other.",
    mockup: <ParallelAgentsMockup />,
  },
  {
    eyebrow: "Works where you work",
    title: "Vnus signs in and works your tools",
    desc: "Log Vnus in once. It uses Gmail, Calendar, GitHub, Notion and your browser exactly like you would.",
    mockup: <ConnectorsMockup />,
  },
  {
    eyebrow: "Gets smarter over time",
    title: "Vnus remembers everything",
    desc: "Show it a workflow once and it saves it as a skill — it keeps facts, preferences and corrections in permanent memory.",
    mockup: <MemoryMockup />,
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = rowRefs.current.map((row) => {
      if (!row) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) row.classList.add("visible"); },
        { threshold: 0.2 }
      );
      obs.observe(row);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative z-10 max-w-5xl mx-auto px-6 py-20"
    >
      <div className="section-marker">How It Works</div>
      <p className="text-gray-500 text-base mb-16 max-w-xl">
        Four steps from zero to your very own agentic demon that handles the boring stuff.
      </p>

      <div className="flex flex-col gap-20">
        {STORIES.map((s, i) => (
          <div
            key={s.title}
            ref={(el) => { rowRefs.current[i] = el; }}
            className="reveal grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
          >
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <p className="text-[#FF3B30] text-xs font-mono uppercase tracking-widest mb-2">{s.eyebrow}</p>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">{s.title}</h3>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md">{s.desc}</p>
            </div>
            <div className={i % 2 === 1 ? "md:order-1" : ""}>{s.mockup}</div>
          </div>
        ))}
      </div>
    </section>
  );
}