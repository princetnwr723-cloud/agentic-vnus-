"use client";
import { useEffect, useRef, useState } from "react";

interface DemoMessage {
  role: "user" | "agent";
  text: string;
}

const SCRIPT: DemoMessage[] = [
  { role: "user",  text: "Clear my inbox and reply to anything urgent" },
  { role: "agent", text: "Scanning 47 unread emails…" },
  { role: "agent", text: "Found 3 urgent — drafting replies now" },
  { role: "agent", text: "✅ Done. 3 replies sent, 44 archived." },
];

const NAV_ITEMS = [
  { icon: "chat", label: "Chat" },
  { icon: "grid", label: "Overview" },
  { icon: "spark", label: "Skills" },
  { icon: "clock", label: "Scheduler" },
  { icon: "dna", label: "Business DNA" },
  { icon: "team", label: "Agent Teams" },
];

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, JSX.Element> = {
    chat: <path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>,
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    spark: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></>,
    dna: <><path d="M6 3c0 6 12 6 12 12M6 21c0-6 12-6 12-12"/></>,
    team: <><circle cx="9" cy="7" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M2 21v-1a6 6 0 016-6h2a6 6 0 016 6v1M16 14.2a4.6 4.6 0 014 4.3V21"/></>,
  };
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

export default function WorkspaceDemo() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState<DemoMessage[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      setStep((s) => {
        const next = (s + 1) % (SCRIPT.length + 2); // pause 2 ticks at the end before looping
        return next;
      });
    }, 1500);
    return () => clearInterval(id);
  }, [inView]);

  useEffect(() => {
    if (step < SCRIPT.length) {
      setVisible(SCRIPT.slice(0, step + 1));
    } else if (step === SCRIPT.length) {
      // hold full conversation
      setVisible(SCRIPT);
    } else {
      // reset for loop
      setVisible([]);
    }
  }, [step]);

  return (
    <section id="workspace-demo" className="relative z-10 max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <div className="section-marker justify-center">Live On Your PC</div>
        <p className="text-gray-500 text-base max-w-xl mx-auto">
          This is the actual Vnus workspace — chat with your agent, watch it work,
          approve anything sensitive, and see everything it remembers.
        </p>
      </div>

      <div ref={wrapRef} className="reveal visible">
        {/* Fake browser window */}
        <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl" style={{ background: "#0a0505" }}>
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            <div className="mx-auto flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 text-[11px] text-gray-500 font-mono">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              agenticvnus.com/dashboard
            </div>
          </div>

          <div className="flex h-[420px]">
            {/* Sidebar */}
            <div className="hidden sm:flex flex-col w-44 border-r border-white/5 py-3 px-2 shrink-0" style={{ background: "rgba(255,255,255,0.015)" }}>
              <div className="flex items-center gap-2 px-2 py-2 mb-2">
                <div className="w-5 h-5 rounded bg-[#FF3B30]/20 border border-[#FF3B30]/30" />
                <span className="text-[11px] font-bold text-white">My PC</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 ml-auto" style={{ boxShadow: "0 0 5px #4ade80" }} />
              </div>
              {NAV_ITEMS.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] mb-0.5 ${
                    i === 0 ? "bg-[#FF3B30]/12 text-[#FF3B30] border border-[#FF3B30]/20" : "text-gray-500"
                  }`}
                >
                  <NavIcon name={item.icon} />
                  {item.label}
                </div>
              ))}
            </div>

            {/* Chat panel */}
            <div className="flex-1 flex flex-col p-5 overflow-hidden">
              <div className="flex-1 flex flex-col gap-3 justify-end">
                {visible.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    style={{ animation: "slideUp 0.4s ease forwards" }}
                  >
                    <div
                      className={`px-4 py-2.5 text-sm rounded-2xl max-w-[75%] ${
                        m.role === "user"
                          ? "bg-[#FF3B30]/15 border border-[#FF3B30]/25 text-white rounded-tr-sm"
                          : "bg-white/5 border border-white/8 text-gray-300 rounded-tl-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {step < SCRIPT.length && step % 1 === 0 && step > 0 && step <= SCRIPT.length && (
                  <div className="flex justify-start" style={{ opacity: visible.length === step ? 1 : 0 }}>
                    <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/8 flex items-center gap-1.5">
                      {[0, 0.2, 0.4].map((d) => (
                        <span
                          key={d}
                          className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]"
                          style={{ animation: `bounce 1.1s ease-in-out ${d}s infinite` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fake input bar */}
              <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.03]">
                <span className="text-gray-600 text-sm">Type a command…</span>
                <span className="w-px h-4 bg-[#FF3B30] ml-1" style={{ animation: "starTwinkle 1s step-end infinite" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce { 0%,80%,100% { transform: scale(0.5); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
      `}</style>
    </section>
  );
}
