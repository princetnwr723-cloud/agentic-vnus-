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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}

const SKILLS = [
  { icon: "mail",     title: "Email Mastery",       tag: "Gmail · Outlook",        desc: "Reads, replies, archives and drafts emails with full context. Zero inbox, zero stress.", wide: true },
  { icon: "calendar", title: "Calendar Control",    tag: "Google · Outlook",       desc: "Reschedules meetings, sets reminders, blocks focus time — autonomously.", wide: true },
  { icon: "plane",    title: "Flight Check-in",     tag: "All Airlines",           desc: "Monitors your bookings and checks you in the moment the window opens.", wide: false },
  { icon: "bell",     title: "Smart Notifications", tag: "Configurable",           desc: "Only pings you when it matters. Filters noise before it reaches you.", wide: false },
  { icon: "task",     title: "Task Automation",     tag: "Notion · Jira · Trello", desc: "Creates Notion pages, Jira tickets, and Trello cards from a single message.", wide: false },
  { icon: "globe",    title: "Web Browsing",        tag: "Any Website",            desc: "Navigates websites, fills forms, extracts info while you focus on real work.", wide: false },
  { icon: "cart",     title: "Agentic Shopping",    tag: "Amazon · Flipkart",      desc: "Finds the best deal, places orders, tracks delivery — hands free.", wide: true },
  { icon: "spark",    title: "Anything You Ask",    tag: "Extensible",             desc: "If it can be done in a browser or chat app, Vnus can be trained to do it.", wide: true },
];

export default function SkillsSection() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = cardRefs.current.map((card, i) => {
      if (!card) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setTimeout(() => card.classList.add("visible"), i * 80); },
        { threshold: 0.1 }
      );
      obs.observe(card);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <section id="skills" className="relative z-10 max-w-6xl mx-auto px-6 py-20">
      <div className="section-marker">Skills</div>
      <p className="text-gray-500 text-base mb-14 max-w-xl">
        Vnus ships with a growing set of built-in skills. Every skill runs autonomously — no
        babysitting required.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {SKILLS.map((skill, i) => (
          <div
            key={skill.title}
            ref={(el) => { cardRefs.current[i] = el; }}
            className={`reveal glass-card rounded-xl p-5 group cursor-default ${skill.wide ? "sm:col-span-2" : ""}`}
          >
            <div className="feature-icon">
              <Icon name={skill.icon} />
            </div>
            <h3 className="text-white font-semibold text-base mb-2">{skill.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{skill.desc}</p>
            <span className="text-xs text-[#FF3B30]/80 bg-[#FF3B30]/10 border border-[#FF3B30]/20 px-2.5 py-1 rounded-full font-mono">
              {skill.tag}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}