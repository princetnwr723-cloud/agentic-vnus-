"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";

const SKILLS = [
  { icon: "📧", name: "Email Agent", desc: "Inbox clear karo, emails bhejo", status: "coming" },
  { icon: "📅", name: "Calendar Agent", desc: "Meetings schedule karo", status: "coming" },
  { icon: "✈️", name: "Flight Check-in", desc: "Auto check-in", status: "coming" },
  { icon: "🌐", name: "Web Browsing", desc: "Koi bhi website navigate karo", status: "coming" },
  { icon: "📝", name: "Task Manager", desc: "Notion, Jira tasks banao", status: "coming" },
  { icon: "💬", name: "WhatsApp Bot", desc: "WhatsApp se control karo", status: "coming" },
];

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [greeting, setGreeting] = useState("Namaste");

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      window.location.href = "/";
    }
  }, [user, loading]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Logout ho gaye! 👋");
    window.location.href = "/";
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-8 h-8 text-[#FF3B30]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
          </svg>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const displayName = user.displayName || user.email?.split("@")[0] || "Bhai";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#050505] text-white">

      {/* Stars background */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 1.5 + 0.5 + "px",
              height: Math.random() * 1.5 + 0.5 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.1,
            }}
          />
        ))}
      </div>

      {/* Topbar */}
      <header className="relative z-10 border-b border-white/5 nav-blur sticky top-0">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
              <circle cx="16" cy="16" r="14" fill="#1a0505" stroke="#FF3B30" strokeWidth="1.5"/>
              <path d="M11 11 C10 8,12 6,13 8 C14 6,15 8,14 11Z" fill="#FF3B30"/>
              <path d="M21 11 C20 8,22 6,23 8 C24 6,21 8,22 11Z" fill="#FF3B30"/>
              <circle cx="13" cy="16" r="2.5" fill="#FF3B30"/>
              <circle cx="19" cy="16" r="2.5" fill="#FF3B30"/>
              <circle cx="13" cy="16" r="1.2" fill="#000"/>
              <circle cx="19" cy="16" r="1.2" fill="#000"/>
            </svg>
            <span className="font-bold text-white text-sm">Vnus AI</span>
          </a>

          {/* User info */}
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-xs hidden sm:block">{user.email}</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#FF3B30]/20 bg-[#FF3B30]/8">
              <div className="w-6 h-6 rounded-full bg-[#FF3B30] flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <span className="text-sm font-medium max-w-[80px] truncate">{displayName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/5 transition-all"
              title="Logout"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">

        {/* Greeting */}
        <div className="mb-10">
          <p className="text-gray-500 text-sm mb-1">{greeting},</p>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            {displayName} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Tumhara Agentic Vnus dashboard — yahan sab skills manage hongi.
          </p>
        </div>

        {/* Status Banner */}
        <div className="rounded-2xl border border-[#FF3B30]/20 p-6 mb-10 relative overflow-hidden"
          style={{ background: "rgba(255,59,48,0.04)" }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF3B30]/40 to-transparent"/>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FF3B30]/15 border border-[#FF3B30]/25 flex items-center justify-center text-xl shrink-0">
              😈
            </div>
            <div>
              <h2 className="text-white font-bold text-base mb-1">
                Vnus Agent — Coming Soon!
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Tumhara account ready hai. Agent abhi build ho raha hai — jaise hi ready hoga, isko yahan se ek click mein apne PC pe set up kar sakte ho. 
                Tab tak landing page explore karo!
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"/>
                <span className="text-yellow-400 text-xs font-semibold">Development mein hai</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Account Status", value: "Active ✅", icon: "🔑" },
            { label: "Plan", value: "Beta Tester 🎯", icon: "⚡" },
            { label: "Tasks Used", value: "0 / ∞", icon: "📊" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-5">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
              <p className="text-white font-bold text-base">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="mb-6">
          <div className="section-marker">Available Skills</div>
          <p className="text-gray-500 text-sm mb-6">
            Yeh skills jald hi activate hongi — ek ek करके release hongi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SKILLS.map((skill) => (
            <div key={skill.name} className="glass-card rounded-xl p-5 relative overflow-hidden group">
              <div className="absolute top-3 right-3">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "rgba(255,190,0,0.1)", color: "#FFBE00", border: "1px solid rgba(255,190,0,0.2)" }}>
                  Coming Soon
                </span>
              </div>
              <div className="feature-icon text-xl">{skill.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-1">{skill.name}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{skill.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-xs">
            Koi sawaal? &nbsp;
            <a href="mailto:hello@vnus.ai" className="text-[#FF3B30] hover:underline">hello@vnus.ai</a>
            &nbsp; pe contact karo 😈
          </p>
        </div>
      </main>
    </div>
  );
}
