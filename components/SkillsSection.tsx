"use client";
import { useEffect, useRef } from "react";

const ICONS: Record<string, JSX.Element> = {
  mail: <path d="M4 4h16v16H4zM4 6l8 7 8-7"/>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
  plane: <path d="M2 12l10-8v5l9 3-9 3v5z"/>,
  bell: <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>,
  task: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12l3 3 6-6"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18"/></>,
  cart: <><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2l2.6 12.4A2 2 0 008.5 17h9a2 2 0 002-1.6L21 7H6"/></>,
  spark: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>,
};

function Icon({ name }: { name: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}

const SKILLS = [
  { icon: "mail",     title: "Email Mastery",     tag: "Gmail · Outlook",       desc: "Reads, replies, archives and drafts with full context.", span: "span-2" },
  { icon: "calendar", title: "Calendar Control",  tag: "Google · Outlook",      desc: "Reschedules meetings and blocks focus time — autonomously.", span: "span-2" },
  { icon: "plane",    title: "Flight Check-in",   tag: "All Airlines",          desc: "Auto checks you in the moment the window opens.", span: "span-1" },
  { icon: "bell",     title: "Smart Notifications", tag: "Configurable",        desc: "Only pings you when it actually matters.", span: "span-1" },
  { icon: "task",     title: "Task Automation",   tag: "Notion · Jira · Trello", desc: "Creates pages, tickets, and cards from one message.", span: "span-1" },
  { icon: "globe",    title: "Web Browsing",      tag: "Any Website",           desc: "Navigates sites and fills forms while you focus on real work.", span: "span-1" },
  { icon: "cart",     title: "Agentic Shopping",  tag: "Amazon · Flipkart",     desc: "Finds the best deal and places the order, hands free.", span: "span-2" },
  { icon: "spark",    title: "Anything You Ask",  tag: "Extensible",            desc: "If it runs in a browser or chat app, Vnus can be trained for it.", span: "span-2" },
];

export default function SkillsSection() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = cardRefs.current.map((card, i) => {
      if (!card) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setTimeout(() => card.classList.add("visible"), i * 60); },
        { threshold: 0.1 }
      );
      obs.observe(card);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <section id="skills" className="relative z-10 max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-14">
        <div className="grok-eyebrow flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" /> Skills
        </div>
        <h2 className="grok-h2 mb-4">Give Vnus a job.</h2>
        <p className="text-[#8a8a8a] text-base max-w-xl mx-auto">
          Every skill runs autonomously — no babysitting required. Mix and match as many as you need.
        </p>
      </div>

      <div className="grok-bento">
        {SKILLS.map((skill, i) => (
          <div
            key={skill.title}
            ref={(el) => { cardRefs.current[i] = el; }}
            className={`grok-reveal grok-card p-6 flex flex-col justify-between ${skill.span}`}
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center text-[#FF3B30] mb-4">
                <Icon name={skill.icon} />
              </div>
              <h3 className="text-white font-semibold text-[15px] mb-1.5">{skill.title}</h3>
              <p className="text-[#7a7a7a] text-sm leading-relaxed">{skill.desc}</p>
            </div>
            <span className="mt-4 inline-block w-fit text-[10.5px] text-[#666] bg-[#111] border border-[#1f1f1f] px-2.5 py-1 rounded-full font-mono">
              {skill.tag}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}