"use client";
import { useEffect, useRef } from "react";

const SKILLS = [
  {
    icon: "📧",
    title: "Email Mastery",
    description: "Reads, replies, archives and drafts emails with full context. Zero inbox, zero stress.",
    tag: "Gmail · Outlook",
  },
  {
    icon: "📅",
    title: "Calendar Control",
    description: "Reschedules meetings, sets reminders, blocks focus time — autonomously.",
    tag: "Google · Outlook",
  },
  {
    icon: "✈️",
    title: "Flight Check-in",
    description: "Monitors your bookings and checks you in the moment the window opens. Automatically.",
    tag: "All Airlines",
  },
  {
    icon: "🔔",
    title: "Smart Notifications",
    description: "Only pings you when it matters. Filters noise before it reaches you.",
    tag: "Configurable",
  },
  {
    icon: "📝",
    title: "Task Automation",
    description: "Creates Notion pages, Jira tickets, and Trello cards from a single message.",
    tag: "Notion · Jira · Trello",
  },
  {
    icon: "🌐",
    title: "Web Browsing",
    description: "Navigates websites, fills forms, and extracts information while you focus on real work.",
    tag: "Any Website",
  },
  {
    icon: "🛒",
    title: "Agentic Shopping",
    description: "Finds the best deal, places orders, tracks delivery — hands free.",
    tag: "Amazon · Flipkart",
  },
  {
    icon: "💡",
    title: "Anything You Ask",
    description: "If it can be done in a browser or chat app, Vnus can be trained to do it for you.",
    tag: "Extensible",
  },
];

export default function SkillsSection() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = cardRefs.current.map((card, i) => {
      if (!card) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setTimeout(() => card.classList.add("visible"), i * 80);
        },
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
            className="reveal glass-card rounded-xl p-5 group cursor-default"
          >
            <div className="feature-icon">{skill.icon}</div>
            <h3 className="text-white font-semibold text-base mb-2">{skill.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{skill.description}</p>
            <span className="text-xs text-[#FF3B30]/80 bg-[#FF3B30]/10 border border-[#FF3B30]/20 px-2.5 py-1 rounded-full font-mono">
              {skill.tag}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}