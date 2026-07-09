"use client";
import { useState } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────
interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  authorType: "official" | "community";
  downloads: number;
  rating: number;
  price: "free" | "pro";
  tags: string[];
  installed: boolean;
  icon: React.ReactNode;
  examples: string[];
}

// ── Icons ──────────────────────────────────────────────────
const IC = {
  email:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  calendar: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  browser:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  files:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  terminal: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  music:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  chat:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  shopping: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
  code:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  search:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  star:     <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  check:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  plus:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  back:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  verified: <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF3B30" stroke="none"><path d="M12 2L13.09 8.26L20 9.27L15 14.14L16.18 21.02L12 17.77L7.82 21.02L9 14.14L4 9.27L10.91 8.26L12 2Z"/></svg>,
};

// ── Ready-made Skills ──────────────────────────────────────
const MARKETPLACE_SKILLS: Skill[] = [
  {
    id: "email-agent",
    name: "Email Agent",
    description: "Clear inbox, send & reply to emails automatically. Works with Gmail and Outlook.",
    category: "productivity",
    author: "Vnus AI",
    authorType: "official",
    downloads: 4820,
    rating: 4.9,
    price: "free",
    tags: ["email", "gmail", "outlook", "inbox"],
    installed: false,
    icon: IC.email,
    examples: ["Clear all unread emails", "Reply to last email from John", "Send email to team about meeting"],
  },
  {
    id: "calendar-agent",
    name: "Calendar Agent",
    description: "Schedule meetings, set reminders, manage your calendar hands-free.",
    category: "productivity",
    author: "Vnus AI",
    authorType: "official",
    downloads: 3210,
    rating: 4.8,
    price: "free",
    tags: ["calendar", "meetings", "schedule"],
    installed: false,
    icon: IC.calendar,
    examples: ["Schedule meeting tomorrow 3PM", "Cancel all Friday meetings", "What is on my calendar today"],
  },
  {
    id: "browser-agent",
    name: "Web Browser Agent",
    description: "Navigate any website, fill forms, extract data and automate web tasks.",
    category: "productivity",
    author: "Vnus AI",
    authorType: "official",
    downloads: 5100,
    rating: 4.7,
    price: "free",
    tags: ["browser", "web", "chrome", "firefox"],
    installed: true,
    icon: IC.browser,
    examples: ["Open Gmail in Chrome", "Search for cheapest flights", "Fill this form automatically"],
  },
  {
    id: "file-manager",
    name: "File Manager",
    description: "Organize, move, rename and delete files across your PC automatically.",
    category: "productivity",
    author: "Vnus AI",
    authorType: "official",
    downloads: 2890,
    rating: 4.6,
    price: "free",
    tags: ["files", "folders", "organize"],
    installed: false,
    icon: IC.files,
    examples: ["Move all PDFs to Documents", "Delete files older than 30 days", "Rename all photos with today's date"],
  },
  {
    id: "terminal-agent",
    name: "Terminal Agent",
    description: "Run shell commands, scripts and automate developer tasks from your dashboard.",
    category: "developer",
    author: "Vnus AI",
    authorType: "official",
    downloads: 1920,
    rating: 4.8,
    price: "pro",
    tags: ["terminal", "shell", "commands", "developer"],
    installed: false,
    icon: IC.terminal,
    examples: ["Run npm install", "Git commit and push", "Check disk usage"],
  },
  {
    id: "music-controller",
    name: "Music Controller",
    description: "Control Spotify, YouTube Music or any music app with simple commands.",
    category: "entertainment",
    author: "community",
    authorType: "community",
    downloads: 1450,
    rating: 4.5,
    price: "free",
    tags: ["spotify", "music", "youtube"],
    installed: false,
    icon: IC.music,
    examples: ["Play Arijit Singh songs", "Skip this song", "Set volume to 50%"],
  },
  {
    id: "whatsapp-agent",
    name: "WhatsApp Agent",
    description: "Send WhatsApp messages, reply and manage chats automatically.",
    category: "communication",
    author: "community",
    authorType: "community",
    downloads: 2100,
    rating: 4.4,
    price: "free",
    tags: ["whatsapp", "messages", "chat"],
    installed: false,
    icon: IC.chat,
    examples: ["Send message to Mom", "Reply to last message", "Send good morning to family group"],
  },
  {
    id: "shopping-agent",
    name: "Shopping Agent",
    description: "Find best deals, compare prices and place orders on Amazon, Flipkart and more.",
    category: "shopping",
    author: "community",
    authorType: "community",
    downloads: 980,
    rating: 4.3,
    price: "pro",
    tags: ["amazon", "flipkart", "shopping", "deals"],
    installed: false,
    icon: IC.shopping,
    examples: ["Find cheapest iPhone on Amazon", "Order my usual groceries", "Track my last order"],
  },
];

const CATEGORIES = ["All", "Productivity", "Developer", "Entertainment", "Communication", "Shopping"];

// ── Skill Card ─────────────────────────────────────────────
function SkillCard({ skill, onInstall, onView }: {
  skill: Skill;
  onInstall: (id: string) => void;
  onView: (skill: Skill) => void;
}) {
  return (
    <div className="glass-card rounded-xl p-5 group relative overflow-hidden cursor-pointer"
      onClick={() => onView(skill)}>
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#FF3B30] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl bg-[#FF3B30]/8 border border-[#FF3B30]/15 flex items-center justify-center text-[#FF3B30] group-hover:bg-[#FF3B30]/14 transition-all shrink-0">
          {skill.icon}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            skill.price === "free"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20"
          }`}>
            {skill.price === "free" ? "Free" : "Pro"}
          </span>
        </div>
      </div>

      {/* Info */}
      <h3 className="text-white font-bold text-sm mb-1">{skill.name}</h3>
      <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{skill.description}</p>

      {/* Author */}
      <div className="flex items-center gap-1.5 mb-3">
        {skill.authorType === "official" ? (
          <span className="text-[#FF3B30]">{IC.verified}</span>
        ) : (
          <div className="w-3.5 h-3.5 rounded-full bg-white/10 flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        )}
        <span className="text-gray-600 text-xs">{skill.author}</span>
        {skill.authorType === "official" && (
          <span className="text-xs text-[#FF3B30]/70">Official</span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1 text-yellow-400">
          {IC.star}
          <span className="text-xs text-gray-400">{skill.rating}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          {IC.download}
          <span className="text-xs text-gray-500">{skill.downloads.toLocaleString()}</span>
        </div>
      </div>

      {/* Install button */}
      <button
        onClick={(e) => { e.stopPropagation(); onInstall(skill.id); }}
        className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
          skill.installed
            ? "bg-green-500/10 text-green-400 border border-green-500/20"
            : "btn-primary text-white"
        }`}>
        {skill.installed ? <>{IC.check} Installed</> : <>{IC.plus} Install</>}
      </button>
    </div>
  );
}

// ── Skill Detail Modal ─────────────────────────────────────
function SkillDetailModal({ skill, onClose, onInstall }: {
  skill: Skill;
  onClose: () => void;
  onInstall: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg z-10">
        <div className="absolute -inset-1 rounded-2xl opacity-20 blur-xl"
          style={{ background: "linear-gradient(135deg,#FF3B30,#CC1A10)" }} aria-hidden />
        <div className="relative rounded-2xl border border-[#FF3B30]/20 overflow-hidden"
          style={{ background: "rgba(8,4,4,0.98)" }}>
          <div className="h-px w-full" style={{ background: "linear-gradient(to right,transparent,#FF3B30,transparent)" }} />

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-center justify-center text-[#FF3B30] shrink-0">
                {skill.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-white font-bold text-lg">{skill.name}</h2>
                  {skill.authorType === "official" && (
                    <span className="text-xs bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20 px-2 py-0.5 rounded-full">Official</span>
                  )}
                </div>
                <p className="text-gray-500 text-sm">by {skill.author}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {IC.star}<span className="text-xs text-gray-400">{skill.rating}</span>
                  </div>
                  <span className="text-gray-600 text-xs">{skill.downloads.toLocaleString()} installs</span>
                </div>
              </div>
              <button onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Description */}
            <p className="text-gray-400 text-sm leading-relaxed mb-5">{skill.description}</p>

            {/* Examples */}
            <div className="mb-5">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Example Commands</p>
              <div className="space-y-2">
                {skill.examples.map((ex, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-white/3 border border-white/6 rounded-lg px-3 py-2">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
                    </svg>
                    <span className="text-gray-300 text-xs font-mono">{ex}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {skill.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-gray-500">
                  {tag}
                </span>
              ))}
            </div>

            {/* Install */}
            <button
              onClick={() => { onInstall(skill.id); onClose(); }}
              className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                skill.installed
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "btn-primary text-white"
              }`}>
              {skill.installed ? <>{IC.check} Already Installed</> : <>{IC.download} Install Skill</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Marketplace Page ──────────────────────────────────
export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [skills, setSkills] = useState<Skill[]>(MARKETPLACE_SKILLS);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const filtered = skills.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some(t => t.includes(search.toLowerCase()));
    const matchCat = category === "All" || s.category === category.toLowerCase();
    return matchSearch && matchCat;
  });

  const handleInstall = (id: string) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, installed: !s.installed } : s));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 1.5 + 0.4 + "px",
              height: Math.random() * 1.5 + 0.4 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.4 + 0.1,
              animation: `starTwinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: Math.random() * 4 + "s",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-white transition-colors">
              {IC.back}
            </Link>
            <div>
              <h1 className="text-3xl font-black text-white">Skill Marketplace</h1>
              <p className="text-gray-500 text-sm mt-0.5">Install ready-made skills or create your own</p>
            </div>
          </div>
          <Link href="/dashboard/skills/create"
            className="btn-primary px-5 py-2.5 rounded-xl text-white font-bold text-sm flex items-center gap-2">
            {IC.plus} Create Skill
          </Link>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">{IC.search}</div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/40 transition-all"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? "bg-[#FF3B30] text-white"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 mb-6 pb-5 border-b border-white/5">
          <div>
            <p className="text-white font-bold text-lg">{skills.length}</p>
            <p className="text-gray-600 text-xs">Total Skills</p>
          </div>
          <div>
            <p className="text-white font-bold text-lg">{skills.filter(s => s.authorType === "official").length}</p>
            <p className="text-gray-600 text-xs">Official</p>
          </div>
          <div>
            <p className="text-white font-bold text-lg">{skills.filter(s => s.installed).length}</p>
            <p className="text-gray-600 text-xs">Installed</p>
          </div>
          <div>
            <p className="text-white font-bold text-lg">{skills.filter(s => s.price === "free").length}</p>
            <p className="text-gray-600 text-xs">Free</p>
          </div>
        </div>

        {/* Official Skills Section */}
        {category === "All" && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#FF3B30]">{IC.verified}</span>
              <h2 className="text-white font-bold text-base">Official Skills</h2>
              <span className="text-xs text-gray-600">by Vnus AI</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {skills.filter(s => s.authorType === "official").map((skill) => (
                <SkillCard key={skill.id} skill={skill} onInstall={handleInstall} onView={setSelectedSkill} />
              ))}
            </div>
          </div>
        )}

        {/* Community / Filtered Skills */}
        <div>
          <h2 className="text-white font-bold text-base mb-4">
            {category === "All" ? "Community Skills" : `${category} Skills`}
            <span className="text-gray-600 text-xs font-normal ml-2">({filtered.filter(s => category !== "All" || s.authorType === "community").length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered
              .filter(s => category !== "All" || s.authorType === "community")
              .map((skill) => (
                <SkillCard key={skill.id} skill={skill} onInstall={handleInstall} onView={setSelectedSkill} />
              ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-sm mb-2">No skills found for &quot;{search}&quot;</p>
              <Link href="/dashboard/skills/create"
                className="text-[#FF3B30] text-sm hover:underline">
                Create this skill yourself
              </Link>
            </div>
          )}
        </div>

        {/* Create CTA */}
        <div className="mt-12 rounded-2xl border border-[#FF3B30]/15 p-8 text-center relative overflow-hidden"
          style={{ background: "rgba(255,59,48,0.03)" }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(to right,transparent,#FF3B30,transparent)" }} />
          <h3 className="text-white font-bold text-xl mb-2">Build your own skill</h3>
          <p className="text-gray-500 text-sm mb-5 max-w-md mx-auto">
            No coding required. Just describe what you want the skill to do and our AI will build it for you.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/dashboard/skills/create?mode=ai"
              className="btn-primary px-6 py-2.5 rounded-xl text-white font-bold text-sm flex items-center gap-2">
              {IC.plus} Build with AI
            </Link>
            <Link href="/dashboard/skills/create?mode=code"
              className="btn-ghost px-6 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2">
              {IC.code} Write Code
            </Link>
          </div>
        </div>
      </div>

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <SkillDetailModal
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
          onInstall={handleInstall}
        />
      )}
    </div>
  );
}