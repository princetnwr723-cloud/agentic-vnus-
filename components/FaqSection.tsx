"use client";
import { useState } from "react";

const FAQS = [
  { q: "How is Vnus different from a regular AI chatbot?", a: "Vnus has its own PC to work with, so it can act inside your real apps and tools — not just answer questions. It runs 24/7, even when your laptop is closed." },
  { q: "Does it work without the internet?", a: "Yes — after first setup, all AI processing runs offline on your machine. Only a tiny WebSocket connection relays commands from your dashboard." },
  { q: "Can I run more than one skill at a time?", a: "Yes. Email, Calendar and Browser agents can all run in parallel — one on your inbox, one on your schedule, one on research." },
  { q: "Where does my data go?", a: "AI processing happens entirely on your machine. Memory, skills and API keys are stored locally and encrypted — never sent to any server." },
  { q: "How much does it cost?", a: "Free to start with local AI. Paid plans unlock bigger models, more workspaces, the scheduler, and multi-agent teams." },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative z-10 max-w-3xl mx-auto px-6 py-20">
      <div className="section-marker justify-center text-center mx-auto">FAQ</div>
      <p className="text-gray-500 text-base mb-10 text-center">Questions, answered.</p>

      <div className="glass-card rounded-2xl divide-y divide-white/5 px-2">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 py-5 px-3 text-left text-white font-semibold text-[15px]"
              >
                {f.q}
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round"
                  className="shrink-0 transition-transform duration-300"
                  style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                >
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: isOpen ? "220px" : "0px" }}
              >
                <p className="px-3 pb-5 text-gray-400 text-sm leading-relaxed">{f.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}