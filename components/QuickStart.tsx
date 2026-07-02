"use client";
import { useState, useEffect, useRef } from "react";

const TABS = ["One-liner", "npm", "Manual"] as const;
type Tab = typeof TABS[number];

const COMMANDS: Record<Tab, { comment: string; cmd: string }> = {
  "One-liner": {
    comment: "# Works everywhere. Installs everything. You're welcome. 😈",
    cmd: "curl -fsSL https://vnus.ai/install.sh | bash",
  },
  npm: {
    comment: "# Install via npm globally",
    cmd: "npm install -g @vnus/cli && vnus init",
  },
  Manual: {
    comment: "# Clone and run manually",
    cmd: "git clone https://github.com/vnus-ai/vnus && cd vnus && npm i && npm start",
  },
};

export default function QuickStart() {
  const [activeTab, setActiveTab] = useState<Tab>("One-liner");
  const [copied, setCopied] = useState(false);
  const [typed, setTyped] = useState("");
  const sectionRef = useRef<HTMLElement>(null);

  const { comment, cmd } = COMMANDS[activeTab];

  // Typewriter effect for command
  useEffect(() => {
    setTyped("");
    let i = 0;
    const interval = setInterval(() => {
      setTyped(cmd.slice(0, i + 1));
      i++;
      if (i >= cmd.length) clearInterval(interval);
    }, 28);
    return () => clearInterval(interval);
  }, [activeTab, cmd]);

  // Scroll reveal
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="get-started"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="reveal relative z-10 max-w-5xl mx-auto px-6 py-20"
    >
      <div className="section-marker">Quick Start</div>

      {/* Terminal */}
      <div className="terminal">
        {/* Title bar */}
        <div className="terminal-bar">
          {/* Traffic lights */}
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
          <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />

          {/* Tabs */}
          <div className="flex items-center gap-1 ml-4">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-[#FF3B30] text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Code body */}
        <div className="p-6 font-mono text-sm leading-relaxed">
          <p className="text-gray-500 mb-3 italic">{comment}</p>
          <div className="flex items-center justify-between gap-4">
            <p>
              <span className="text-[#FF3B30] font-bold">$&nbsp;</span>
              <span className="text-green-400">{typed}</span>
              <span className="animate-pulse text-green-400">▌</span>
            </p>
            <button
              onClick={handleCopy}
              title="Copy command"
              className="text-gray-500 hover:text-white transition-colors shrink-0"
            >
              {copied ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Subtext */}
      <p className="text-gray-500 text-sm mt-4 text-center leading-relaxed">
        Works on macOS, Linux, and Windows. The one-liner installs Node.js and everything else
        for you. Switch later with{" "}
        <code className="text-gray-300 bg-white/5 px-1.5 py-0.5 rounded text-xs">vnus update --channel dev</code>{" "}
        or{" "}
        <code className="text-gray-300 bg-white/5 px-1.5 py-0.5 rounded text-xs">vnus update --channel stable</code>.
      </p>
    </section>
  );
}