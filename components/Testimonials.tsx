"use client";
import { useRef, useEffect } from "react";

const TESTIMONIALS = [
  {
    handle: "@rajdev_io",
    avatar: "RD",
    color: "#FF3B30",
    text: "Vnus cleared 3 weeks of emails in 8 minutes. I genuinely thought my laptop was possessed.",
  },
  {
    handle: "@priya_builds",
    avatar: "PB",
    color: "#8B5CF6",
    text: "It rescheduled 4 meetings while I was asleep. Woke up to a perfectly organized week. Running my company now.",
  },
  {
    handle: "@nexttechguy",
    avatar: "NT",
    color: "#10B981",
    text: "After years of AI hype I thought nothing could faze me. Vnus went from 'hi what can you do?' to booking my flight in 40 seconds.",
  },
  {
    handle: "@ankurcodes",
    avatar: "AC",
    color: "#F59E0B",
    text: "This is genuinely the first AI that feels like an assistant rather than an autocomplete.",
  },
  {
    handle: "@meera_ux",
    avatar: "MU",
    color: "#EC4899",
    text: "Vnus drafted, edited and sent 12 client emails in the time it took me to make chai. Unreal.",
  },
  {
    handle: "@0xSaurabh",
    avatar: "0S",
    color: "#06B6D4",
    text: "Try Vnus AI if you want something more powerful and actually agentic 🤯 No cap.",
  },
  {
    handle: "@tarunjoshi_dev",
    avatar: "TJ",
    color: "#FF3B30",
    text: "It set up my entire Notion workspace from a voice note. I said 'organize my projects' and it just... did.",
  },
  {
    handle: "@designwithneha",
    avatar: "DN",
    color: "#A855F7",
    text: "This demon is running my calendar better than I ever did. 2026 is already the year of personal agents.",
  },
];

// Duplicate for seamless loop
const ALL = [...TESTIMONIALS, ...TESTIMONIALS];

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div className="testimonial-card shrink-0 w-72">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ background: t.color }}
        >
          {t.avatar}
        </div>
        <span className="text-[#FF3B30] text-sm font-semibold">{t.handle}</span>
      </div>
      <p className="text-gray-300 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
    </div>
  );
}

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("visible"); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="testimonials"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="reveal relative z-10 py-20 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="section-marker">What People Say</div>
          <a href="#testimonials" className="text-[#FF3B30] text-sm hover:underline flex items-center gap-1">
            View all
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Row 1 — left to right */}
      <div className="relative overflow-hidden mb-4">
        <div
          ref={row1Ref}
          className="flex gap-4"
          style={{ animation: "marquee 40s linear infinite", width: "max-content" }}
        >
          {ALL.map((t, i) => (
            <TestimonialCard key={`r1-${i}`} t={t} />
          ))}
        </div>
        {/* Fade masks */}
        <div className="absolute inset-y-0 left-0 w-24 pointer-events-none" style={{ background: "linear-gradient(to right, #050505, transparent)" }} />
        <div className="absolute inset-y-0 right-0 w-24 pointer-events-none" style={{ background: "linear-gradient(to left, #050505, transparent)" }} />
      </div>

      {/* Row 2 — right to left */}
      <div className="relative overflow-hidden">
        <div
          ref={row2Ref}
          className="flex gap-4"
          style={{ animation: "marquee 35s linear infinite reverse", width: "max-content" }}
        >
          {[...ALL].reverse().map((t, i) => (
            <TestimonialCard key={`r2-${i}`} t={t} />
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 w-24 pointer-events-none" style={{ background: "linear-gradient(to right, #050505, transparent)" }} />
        <div className="absolute inset-y-0 right-0 w-24 pointer-events-none" style={{ background: "linear-gradient(to left, #050505, transparent)" }} />
      </div>
    </section>
  );
}