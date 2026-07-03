"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import DemonMascot from "@/components/DemonMascot";
import toast from "react-hot-toast";

const SKILLS = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    name: "Email Agent",
    desc: "Clear inbox, send & reply to emails automatically",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    name: "Calendar Agent",
    desc: "Schedule meetings, set reminders, manage your time",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    name: "Flight Check-in",
    desc: "Auto check-in the moment the window opens",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
      </svg>
    ),
    name: "Web Browsing",
    desc: "Navigate any website, fill forms, extract data",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/>
        <line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/>
        <line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
    name: "Task Manager",
    desc: "Create Notion pages, Jira tickets, Trello cards",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
    name: "WhatsApp Bot",
    desc: "Control your agent from any chat app you use",
  },
];

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [greeting, setGreeting] = useState("Hello");
  const [userData, setUserData] = useState<{ name?: string; profession?: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!loading && !user) window.location.href = "/";
  }, [user, loading]);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good Morning");
    else if (h < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) setUserData(snap.data());
      else window.location.href = "/onboarding";
    });
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("See you soon! 👋");
    window.location.href = "/";
  };

  if (loading || !user || !userData) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-[#FF3B30]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          <p className="text-gray-600 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const displayName = userData.name || user.displayName || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden">

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        {Array.from({ length: 80 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 1.5 + 0.4 + "px",
              height: Math.random() * 1.5 + 0.4 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.1,
              animation: `starTwinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: Math.random() * 4 + "s",
            }}
          />
        ))}
      </div>

      {/* Red ambient */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse 70% 35% at 50% 0%, rgba(120,15,15,0.15) 0%, transparent 70%)" }}
        aria-hidden
      />

      {/* Top bar */}
      <header className="relative z-10 nav-blur border-b border-white/5 sticky top-0">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
              <circle cx="16" cy="16" r="14" fill="#1a0505" stroke="#FF3B30" strokeWidth="1.5"/>
              <path d="M11 11C10 8 12 6 13 8 14 6 15 8 14 11Z" fill="#FF3B30"/>
              <path d="M21 11C20 8 22 6 23 8 24 6 21 8 22 11Z" fill="#FF3B30"/>
              <circle cx="13" cy="16" r="2.5" fill="#FF3B30"/>
              <circle cx="19" cy="16" r="2.5" fill="#FF3B30"/>
              <circle cx="13" cy="16" r="1.2" fill="#000"/>
              <circle cx="19" cy="16" r="1.2" fill="#000"/>
            </svg>
            <span className="font-bold text-white text-sm group-hover:text-[#FF3B30] transition-colors">Vnus AI</span>
          </a>

          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-xs hidden sm:block">{user.email}</span>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#FF3B30]/20 bg-[#FF3B30]/8 hover:bg-[#FF3B30]/12 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-[#FF3B30] flex items-center justify-center text-xs font-bold">{initials}</div>
                <span className="text-sm font-medium max-w-[80px] truncate">{displayName}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-white/8 overflow-hidden shadow-2xl z-50"
                  style={{ background: "rgba(10,5,5,0.98)" }}>
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-white text-xs font-semibold truncate">{displayName}</p>
                    <p className="text-gray-500 text-xs">{userData.profession}</p>
                  </div>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">

        {/* HERO — Demon + Greeting */}
        <div
          className="flex flex-col md:flex-row items-center gap-8 mb-12"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.7s ease" }}
        >
          {/* Demon mascot */}
          <div className="shrink-0 relative">
            <DemonMascot size={140} />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-20 h-4 rounded-full"
              style={{ background: "radial-gradient(ellipse, rgba(255,59,48,0.4) 0%, transparent 70%)", filter: "blur(4px)", animation: "pulseGlow 3s ease-in-out infinite" }}
              aria-hidden
            />
          </div>

          {/* Welcome text */}
          <div>
            <p className="text-gray-500 text-sm mb-1">{greeting},</p>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
              {displayName} 👋
            </h1>
            {userData.profession && (
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
                style={{ background: "rgba(255,59,48,0.1)", color: "#FF3B30", border: "1px solid rgba(255,59,48,0.22)" }}>
                {userData.profession}
              </span>
            )}
            <p className="text-gray-500 text-sm leading-relaxed max-w-md">
              Your Agentic Vnus dashboard. All your AI skills and agent controls will live here.
            </p>
          </div>
        </div>

        {/* Setup Agent Banner */}
        <div
          className="rounded-2xl border border-[#FF3B30]/20 p-6 mb-10 relative overflow-hidden"
          style={{
            background: "rgba(255,59,48,0.04)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.7s ease 0.2s",
          }}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(to right, transparent, #FF3B30, transparent)" }}
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-[#FF3B30]/12 border border-[#FF3B30]/22 flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-white font-bold text-base mb-1">Set Up Your Agent</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your Vnus agent runs directly on your PC — no cloud required. Once set up, control everything from here or any chat app.
              </p>
            </div>
            <button className="btn-primary px-6 py-2.5 rounded-xl text-white font-bold text-sm shrink-0 flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              Download Agent
            </button>
          </div>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.7s ease 0.3s",
          }}
        >
          {[
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, label: "Account Status", value: "Active" },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, label: "Plan", value: "Beta Tester" },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, label: "Tasks Completed", value: "0 / ∞" },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-xl p-5 flex items-center gap-4">
              <div className="feature-icon !mb-0 !w-10 !h-10 shrink-0">{s.icon}</div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">{s.label}</p>
                <p className="text-white font-bold text-base">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.7s ease 0.4s",
          }}
        >
          <div className="section-marker mb-1">Agent Skills</div>
          <p className="text-gray-500 text-sm mb-6">These skills will activate one by one as we release them.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SKILLS.map((skill, i) => (
              <div
                key={skill.name}
                className="glass-card rounded-xl p-5 group relative overflow-hidden"
                style={{ animation: `fadeIn 0.5s ease ${0.5 + i * 0.08}s both` }}
              >
                {/* Red left accent on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#FF3B30] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,190,0,0.08)", color: "#FFBE00", border: "0.5px solid rgba(255,190,0,0.2)" }}>
                  Soon
                </span>
                <div className="w-12 h-12 rounded-xl bg-[#FF3B30]/8 border border-[#FF3B30]/18 flex items-center justify-center mb-4 group-hover:bg-[#FF3B30]/15 group-hover:border-[#FF3B30]/30 transition-all duration-300">
                  {skill.icon}
                </div>
                <h3 className="text-white font-bold text-sm mb-1.5">{skill.name}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{skill.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-14 text-center">
          <p className="text-gray-700 text-xs">
            Questions?{" "}
            <a href="mailto:hello@vnus.ai" className="text-[#FF3B30] hover:underline">hello@vnus.ai</a>
          </p>
        </div>
      </main>
    </div>
  );
}