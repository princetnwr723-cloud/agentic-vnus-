"use client";
import { useEffect, useRef } from "react";

const STEPS = [
  {
    number: "01",
    icon: "💬",
    title: "Connect Your Chat App",
    description:
      "Link Vnus AI to WhatsApp, Telegram, Discord, or any messaging platform you already use daily. No new app to learn.",
  },
  {
    number: "02",
    icon: "🔗",
    title: "Grant Permissions",
    description:
      "Securely connect your Gmail, Google Calendar, or Outlook in one click. Your data stays encrypted and private.",
  },
  {
    number: "03",
    icon: "😈",
    title: "Just Tell Vnus What To Do",
    description:
      'Type "clear my inbox", "reschedule tomorrow\'s meeting", or "check me in for my flight". Vnus does it instantly.',
  },
  {
    number: "04",
    icon: "⚡",
    title: "Watch It Execute",
    description:
      "Vnus autonomously navigates apps, fills forms, sends emails, and reports back — like a real assistant, not a chatbot.",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = cardRefs.current.map((card, i) => {
      if (!card) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => card.classList.add("visible"), i * 120);
          }
        },
        { threshold: 0.1 }
      );
      obs.observe(card);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative z-10 max-w-6xl mx-auto px-6 py-20"
    >
      <div className="section-marker">How It Works</div>
      <p className="text-gray-500 text-base mb-14 max-w-xl">
        Four steps from zero to your very own agentic demon that handles the boring stuff.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {STEPS.map((step, i) => (
          <div
            key={step.number}
            ref={(el) => { cardRefs.current[i] = el; }}
            className="reveal glass-card rounded-2xl p-7 relative overflow-hidden group"
          >
            {/* Background step number */}
            <span
              className="absolute top-4 right-6 text-6xl font-black text-white/3 select-none pointer-events-none"
              aria-hidden
            >
              {step.number}
            </span>

            {/* Red accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#FF3B30] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="feature-icon text-2xl" aria-hidden>{step.icon}</div>

            <h3 className="text-white font-bold text-lg mb-3">
              <span className="text-[#FF3B30] text-sm font-mono mr-2">{step.number}</span>
              {step.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>

      {/* Connector lines decoration */}
      <div className="hidden md:flex justify-center mt-8 gap-4 items-center" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#FF3B30]/40 to-transparent" />
            <div className="w-2 h-2 rounded-full bg-[#FF3B30]/40" />
          </div>
        ))}
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#FF3B30]/40 to-transparent" />
      </div>
    </section>
  );
}