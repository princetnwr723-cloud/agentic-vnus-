"use client";
import { useEffect, useRef } from "react";

function ChatMockup() {
  return (
    <div className="grok-card p-5 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-[#333]" />
        <span className="w-2 h-2 rounded-full bg-[#333]" />
        <span className="w-2 h-2 rounded-full bg-[#333]" />
        <span className="ml-2 text-xs text-[#555] font-mono">vnus — clear inbox</span>
      </div>
      <div className="flex justify-end mb-3">
        <div className="bg-white text-black text-xs px-3 py-2 rounded-xl rounded-tr-sm max-w-[80%]">
          Clear my inbox and reply to anything urgent
        </div>
      </div>
      <div className="flex justify-start">
        <div className="bg-[#111] border border-[#1c1c1c] text-[#bbb] text-xs px-3 py-2 rounded-xl rounded-tl-sm max-w-[85%]">
          On it — scanning 47 unread, drafting 4 replies
          <span className="grok-caret h-3 ml-1 align-middle" />
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
    <div className="grok-card p-5 w-full max-w-sm space-y-3">
      {rows.map((r, i) => (
        <div key={r.label}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#999]">{r.label}</span>
            <span className="text-xs text-[#444]">running</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#151515] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF3B30] to-[#ff8a80]"
              style={{ width: r.w, animation: `vnusGrowBar 2.4s ease-in-out ${i * 0.3}s infinite alternate` }}
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
    <div className="grok-card p-5 w-full max-w-sm">
      <div className="grid grid-cols-3 gap-2.5">
        {apps.map((app) => (
          <div key={app} className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border border-[#1c1c1c] bg-[#0d0d0d]">
            <div className="w-6 h-6 rounded-md bg-[#1a1a1a] border border-[#2a2a2a]" />
            <span className="text-[10px] text-[#666]">{app}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MemoryMockup() {
  return (
    <div className="grok-card p-5 w-full max-w-sm">
      <div className="text-xs text-[#666] mb-3">Updated memory for <span className="text-white font-semibold">Account Manager</span></div>
      <div className="space-y-2">
        {["Only signs annual contracts", "Dana approves final pricing", "Prefers async follow-ups"].map((f) => (
          <div key={f} className="flex items-center gap-2 text-xs text-[#999] bg-[#0d0d0d] border border-[#1c1c1c] rounded-lg px-3 py-2">
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
    desc: "Give it a task on desktop, WhatsApp, or Telegram. It takes the project start to finish, keeps context on how you work, and comes back only when your approval is needed.",
    mockup: <ChatMockup />,
  },
  {
    eyebrow: "Parallel execution",
    title: "Run many skills at once",
    desc: "Spin up Email, Calendar, and Browser agents in parallel. They work 24/7 in the background — one on your inbox, one on your schedule, one on research — without waiting on each other.",
    mockup: <ParallelAgentsMockup />,
  },
  {
    eyebrow: "Works where you work",
    title: "Vnus signs in and works your tools",
    desc: "Log Vnus in once. It uses Gmail, Calendar, GitHub, Notion, and your browser exactly like you would — including the tools that are annoying to automate.",
    mockup: <ConnectorsMockup />,
  },
  {
    eyebrow: "Gets smarter over time",
    title: "Vnus remembers everything",
    desc: "Show it a workflow once and it saves it as a skill. It keeps facts, preferences, and corrections in permanent memory — so it never asks the same question twice.",
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
    <section id="how-it-works" ref={sectionRef as React.RefObject<HTMLElement>} className="relative z-10 max-w-5xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <div className="grok-eyebrow flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" /> How it works
        </div>
        <h2 className="grok-h2">Give real work to Vnus.</h2>
      </div>

      <div className="flex flex-col gap-24">
        {STORIES.map((s, i) => (
          <div
            key={s.title}
            ref={(el) => { rowRefs.current[i] = el; }}
            className="grok-reveal grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
          >
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <div className="grok-eyebrow">{s.eyebrow}</div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">{s.title}</h3>
              <p className="text-[#8a8a8a] text-sm md:text-base leading-relaxed max-w-md">{s.desc}</p>
            </div>
            <div className={`flex justify-center ${i % 2 === 1 ? "md:order-1" : ""}`}>
              {s.mockup}
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes vnusGrowBar { from { opacity: .5; } to { opacity: 1; } }
      `}</style>
    </section>
  );
}