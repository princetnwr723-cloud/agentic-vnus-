"use client";
import { useState } from "react";

const FAQS = [
  { q: "How is Vnus different from a regular AI chatbot?", a: "Vnus has its own PC to work with, so it can act inside your real apps and tools — not just answer questions. It runs 24/7, even when your laptop is closed." },
  { q: "Does it work without the internet?", a: "Yes — after first setup, all AI processing runs offline on your machine. Only a tiny WebSocket connection is used to relay commands from your dashboard." },
  { q: "Can I run more than one skill at a time?", a: "Yes. Email, Calendar, and Browser agents (and more) can all run in parallel — one on your inbox, one on your schedule, one on research." },
  { q: "Where does my data go?", a: "AI processing happens entirely on your machine. Memory, skills, and API keys are stored locally and encrypted — never sent to any server." },
  { q: "How much does it cost?", a: "Free to start with local AI. Paid plans unlock bigger models, more workspaces, the scheduler, and multi-agent teams — see Plans for details." },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative z-10 max-w-3xl mx-auto px-6 py-24">
      <div className="text-center mb-12">
        <div className="grok-eyebrow flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" /> FAQ
        </div>
        <h2 className="grok-h2">Questions, answered.</h2>
      </div>

      <div className="grok-card px-5">
        {FAQS.map((f, i) => (
          <div key={f.q} className={`grok-faq-item ${open === i ? "open" : ""} ${i === FAQS.length - 1 ? "!border-b-0" : ""}`}>
            <button className="grok-faq-q" onClick={() => setOpen(open === i ? null : i)}>
              {f.q}
              <svg className="grok-faq-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <div className="grok-faq-a">{f.a}</div>
          </div>
        ))}
      </div>
    </section>
  );
}