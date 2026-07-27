"use client";
import { useRef, useEffect } from "react";

const DOCS = [
  {
    badge: "GUIDE",
    date: "Jun 28, 2026",
    title: "Getting started with Agentic Vnus in under 5 minutes",
    description: "Install, connect your first integration, and run your first agentic task — complete walkthrough.",
    color: "#FF3B30",
    href: "/docs.html#getting-started",
  },
  {
    badge: "REFERENCE",
    date: "Jun 20, 2026",
    title: "All AI Models — RAM requirements and performance guide",
    description: "Every model available in Agentic Vnus, RAM tiers, the 50% RAM rule, and how to pick the right one.",
    color: "#8B5CF6",
    href: "/docs.html#models",
  },
  {
    badge: "LATEST",
    date: "Jun 15, 2026",
    title: "Memory & Self-Improving Skills system explained",
    description: "How the agent learns your preferences, saves successful task patterns, and gets faster over time.",
    color: "#10B981",
    href: "/docs.html#memory",
  },
  {
    badge: "TUTORIAL",
    date: "Jun 8, 2026",
    title: "GitHub integration — read, write, commit, create PRs",
    description: "Full GitHub REST API integration — no git commands needed. Token setup, all supported operations.",
    color: "#F59E0B",
    href: "/docs.html#github",
  },
];

export default function DocsSection() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = cardRefs.current.map((card, i) => {
      if (!card) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setTimeout(() => card.classList.add("visible"), i * 100);
        },
        { threshold: 0.1 }
      );
      obs.observe(card);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <section id="docs" className="relative z-10 max-w-6xl mx-auto px-6 py-20">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-12">
        <div>
          <p className="text-[#FF3B30] uppercase tracking-widest text-xs font-semibold mb-2">LATEST</p>
          <h2 className="text-white text-3xl md:text-4xl font-black">
            Docs with depth.
          </h2>
        </div>
        <a
          href="/docs.html"
          className="text-[#FF3B30] text-sm hover:underline flex items-center gap-1"
        >
          Read all docs
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {DOCS.map((doc, i) => (
          <a
            key={doc.title}
            href={doc.href}
            ref={(el) => { cardRefs.current[i] = el as HTMLDivElement; }}
            className="reveal glass-card rounded-xl p-6 group cursor-pointer block"
            style={{ textDecoration: "none" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: `${doc.color}20`, color: doc.color, border: `1px solid ${doc.color}40` }}
              >
                {doc.badge}
              </span>
              <span className="text-gray-600 text-xs">{doc.date}</span>
            </div>

            <h3 className="text-white font-bold text-base mb-2 group-hover:text-[#FF3B30] transition-colors">
              {doc.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">{doc.description}</p>

            <div className="flex items-center gap-1 mt-4 text-[#FF3B30] text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Read more
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}