"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import DemonMascot from "@/components/DemonMascot";
import SetUpAgentModal from "@/components/SetUpAgentModal";
import AddWorkspaceModal, { WorkspaceData } from "@/components/AddWorkspaceModal";
import toast from "react-hot-toast";

// ── Plan config (matches PricingSection) ──────────────────
const PLAN_META: Record<string, { label: string; color: string; tokenLimit: number; taskLimit: number }> = {
  free:       { label: "Free",       color: "#6b7280", tokenLimit: 200_000,    taskLimit: 50   },
  starter:    { label: "Starter",    color: "#6b7280", tokenLimit: 1_000_000,  taskLimit: 250  },
  pro:        { label: "Pro",        color: "#FF3B30", tokenLimit: 2_000_000,  taskLimit: 500  },
  pro_max:    { label: "Pro Max",    color: "#FF3B30", tokenLimit: 5_000_000,  taskLimit: 1250 },
  elite:      { label: "Elite",      color: "#a855f7", tokenLimit: 20_000_000, taskLimit: 5000 },
  elite_ultra:{ label: "Elite Ultra",color: "#a855f7", tokenLimit: 40_000_000, taskLimit: 10000},
};

const SKILLS = [
  { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, name: "Email Agent",    desc: "Clear inbox, send & reply to emails automatically" },
  { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, name: "Calendar Agent", desc: "Schedule meetings, set reminders, manage your time" },
  { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>, name: "Web Browsing",   desc: "Navigate any website, fill forms, extract data" },
  { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>, name: "Task Manager",   desc: "Create Notion pages, Jira tickets, Trello cards" },
  { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>, name: "Flight Check-in", desc: "Auto check-in the moment the window opens" },
  { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>, name: "Chat Control",    desc: "Control your agent from WhatsApp, Telegram & more" },
];

// ── Workspace Card ─────────────────────────────────────────
function WorkspaceCard({ workspace, onDisconnect }: { workspace: WorkspaceData; onDisconnect: (id: string) => void }) {
  const osIcon = workspace.os.toLowerCase().includes("win")
    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#00A4EF"><path d="M3 12V6.75l6-1.32V12H3zM3 13h6v6.57L3 18.18V13zM10 5.23L21 3v9h-11V5.23zM10 13h11v9l-11-1.81V13z"/></svg>
    : workspace.os.toLowerCase().includes("mac")
    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#999"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
    : <svg width="14" height="14" viewBox="0 0 24 24" fill="#FCC624"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>;

  return (
    <div className="glass-card rounded-xl p-5 group relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, rgba(255,59,48,0.3), transparent)" }} />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#FF3B30]/8 border border-[#FF3B30]/15 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-sm truncate">{workspace.pcName}</h3>
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${workspace.status === "online" ? "bg-green-400" : "bg-gray-600"}`}
                style={workspace.status === "online" ? { boxShadow: "0 0 6px #4ade80" } : {}}
              />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {osIcon}
              <span className="text-gray-500 text-xs">{workspace.os}</span>
            </div>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
          workspace.status === "online"
            ? "bg-green-500/10 text-green-400 border border-green-500/20"
            : "bg-white/5 text-gray-500 border border-white/10"
        }`}>
          {workspace.status === "online" ? "Online" : "Offline"}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <a
          href={`/dashboard/workspace/${workspace.id}`}
          className="btn-primary flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Open Agent
        </a>
        <button
          onClick={() => onDisconnect(workspace.id)}
          className="px-3 py-2 rounded-lg text-xs font-semibold text-gray-500 hover:text-red-400 border border-white/8 hover:border-red-500/20 transition-all"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

// ── Plan Usage Card ────────────────────────────────────────
function PlanCard({ planKey, tokensUsed }: { planKey: string; tokensUsed: number }) {
  const plan = PLAN_META[planKey] ?? PLAN_META["free"];
  const pct  = Math.min(100, Math.round((tokensUsed / plan.tokenLimit) * 100));

  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(0)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : `${n}`;

  return (
    <div
      className="rounded-xl border p-4 relative overflow-hidden"
      style={{
        background: `${plan.color}08`,
        borderColor: `${plan.color}30`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${plan.color}18`, color: plan.color, border: `1px solid ${plan.color}35` }}
          >
            {plan.label}
          </span>
          <span className="text-gray-500 text-xs">plan</span>
        </div>
        <a
          href="#pricing"
          className="text-xs font-semibold flex items-center gap-1 transition-colors"
          style={{ color: plan.color }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          Upgrade
        </a>
      </div>

      {/* Token bar */}
      <div className="mb-1.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-500 text-xs">Tokens used</span>
          <span className="text-gray-400 text-xs">{fmt(tokensUsed)} / {fmt(plan.tokenLimit)}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: pct > 80
                ? "linear-gradient(90deg,#FF3B30,#CC1A10)"
                : `linear-gradient(90deg,${plan.color},${plan.color}88)`,
            }}
          />
        </div>
      </div>
      <p className="text-gray-600 text-xs">{pct}% used · resets monthly</p>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────
export default function Dashboard() {
  const { user, loading } = useAuth();
  const [greeting,      setGreeting]      = useState("Hello");
  const [userData,      setUserData]      = useState<{ name?: string; profession?: string; plan?: string; tokensUsed?: number } | null>(null);
  const [fetchDone,     setFetchDone]     = useState(false);
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [visible,       setVisible]       = useState(false);
  const [setupOpen,     setSetupOpen]     = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspaces,    setWorkspaces]    = useState<WorkspaceData[]>([]);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12)      setGreeting("Good Morning");
    else if (h < 17) setGreeting("Good Afternoon");
    else             setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    if (!loading && !user) window.location.href = "/";
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid))
      .then((snap) => {
        if (snap.exists()) setUserData(snap.data() as { name: string; profession: string; plan?: string; tokensUsed?: number });
        else window.location.href = "/onboarding";
      })
      .catch(() => setUserData({ name: user.displayName || "", profession: "" }))
      .finally(() => { setFetchDone(true); setTimeout(() => setVisible(true), 50); });

    getDocs(query(
      collection(db, "agent_connections"),
      where("userId", "==", user.uid),
      where("status", "==", "connected")
    )).then((snap) => {
      const ws: WorkspaceData[] = snap.docs.map(d => ({
        id:          d.id,
        code:        d.data().code,
        pcName:      d.data().pcName || "My PC",
        os:          d.data().os || "Unknown OS",
        status:      "offline" as const,
        connectedAt: d.data().connectedAt,
      }));
      setWorkspaces(ws);
    }).catch(() => {});
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Signed out successfully!");
    window.location.href = "/";
  };

  const handleWorkspaceConnected = (workspace: WorkspaceData) => setWorkspaces(prev => [...prev, workspace]);
  const handleDisconnect = (id: string) => {
    setWorkspaces(prev => prev.filter(w => w.id !== id));
    toast.success("Workspace disconnected.");
  };

  if (loading || !user || !fetchDone) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          <p className="text-gray-600 text-xs tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  const displayName = userData?.name || user.displayName || user.email?.split("@")[0] || "User";
  const initials    = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const planKey     = userData?.plan ?? "free";
  const tokensUsed  = userData?.tokensUsed ?? 0;
  const planMeta    = PLAN_META[planKey] ?? PLAN_META["free"];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        {Array.from({ length: 80 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width:          Math.random() * 1.5 + 0.4 + "px",
              height:         Math.random() * 1.5 + 0.4 + "px",
              top:            Math.random() * 100 + "%",
              left:           Math.random() * 100 + "%",
              opacity:        Math.random() * 0.5 + 0.1,
              animation:      `starTwinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: Math.random() * 4 + "s",
            }}
          />
        ))}
      </div>
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse 70% 35% at 50% 0%, rgba(120,15,15,0.15) 0%, transparent 70%)" }}
        aria-hidden
      />

      {/* Topbar */}
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
            {/* Plan badge in topbar */}
            <a
              href="/#pricing"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: `${planMeta.color}12`, color: planMeta.color, borderColor: `${planMeta.color}30` }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              {planMeta.label}
            </a>

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
                <div
                  className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-white/8 overflow-hidden shadow-2xl z-50"
                  style={{ background: "rgba(8,4,4,0.98)" }}
                >
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-white text-xs font-semibold truncate">{displayName}</p>
                    {userData?.profession && <p className="text-gray-500 text-xs mt-0.5">{userData.profession}</p>}
                  </div>
                  <a
                    href="/#pricing"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#FF3B30] hover:bg-white/5 transition-colors"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                    Upgrade Plan
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
                  >
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

        {/* Hero */}
        <div
          className="flex flex-col md:flex-row items-center gap-8 mb-10"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}
        >
          <div className="shrink-0 relative">
            <DemonMascot size={130} />
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-2 w-16 h-4 rounded-full"
              style={{ background: "radial-gradient(ellipse, rgba(255,59,48,0.4) 0%, transparent 70%)", filter: "blur(4px)", animation: "pulseGlow 3s ease-in-out infinite" }}
              aria-hidden
            />
          </div>
          <div className="flex-1">
            <p className="text-gray-500 text-sm mb-1">{greeting},</p>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{displayName} 👋</h1>
            {userData?.profession && (
              <span
                className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3"
                style={{ background: "rgba(255,59,48,0.1)", color: "#FF3B30", border: "1px solid rgba(255,59,48,0.2)" }}
              >
                {userData.profession}
              </span>
            )}
            <p className="text-gray-500 text-sm leading-relaxed max-w-md">
              Your Agentic Vnus dashboard. Set up your agent and connect your PC to get started.
            </p>
          </div>

          {/* Plan usage — right side of hero */}
          <div className="w-full md:w-64 shrink-0">
            <PlanCard planKey={planKey} tokensUsed={tokensUsed} />
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="flex flex-wrap gap-3 mb-10"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 0.1s" }}
        >
          <button onClick={() => setSetupOpen(true)}
            className="btn-primary px-5 py-2.5 rounded-xl text-white font-bold text-sm flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            Set Up Agent
          </button>
          <button onClick={() => setWorkspaceOpen(true)}
            className="btn-ghost px-5 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Add Workspace
          </button>
          <a href="/dashboard/marketplace"
            className="btn-ghost px-5 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Skill Marketplace
          </a>
          <a href="/#pricing"
            className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
            style={{ background: `${planMeta.color}15`, color: planMeta.color, border: `1px solid ${planMeta.color}30` }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            Upgrade Plan
          </a>
        </div>

        {/* Workspaces */}
        <div className="mb-10" style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 0.15s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="section-marker">Workspaces</div>
            <button onClick={() => setWorkspaceOpen(true)} className="text-xs text-[#FF3B30] hover:underline flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Workspace
            </button>
          </div>

          {workspaces.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <p className="text-gray-500 text-sm mb-1">No workspaces connected yet</p>
              <p className="text-gray-600 text-xs mb-4">Set up the agent on your PC, then enter the 10-digit code here.</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setSetupOpen(true)} className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold text-white">Set Up Agent</button>
                <button onClick={() => setWorkspaceOpen(true)} className="btn-ghost px-4 py-2 rounded-lg text-xs font-semibold text-white">Enter Code</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map(ws => (
                <WorkspaceCard key={ws.id} workspace={ws} onDisconnect={handleDisconnect} />
              ))}
              <button onClick={() => setWorkspaceOpen(true)}
                className="rounded-xl border border-dashed border-white/10 p-5 flex flex-col items-center justify-center gap-2 hover:border-[#FF3B30]/30 hover:bg-[#FF3B30]/3 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-white/4 flex items-center justify-center group-hover:bg-[#FF3B30]/10 transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" className="group-hover:stroke-[#FF3B30] transition-colors">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <span className="text-gray-600 text-xs group-hover:text-gray-400 transition-colors">Add another PC</span>
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 0.2s" }}
        >
          {[
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, label: "Account Status", value: "Active" },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, label: "Plan", value: planMeta.label },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/></svg>, label: "PCs Connected", value: `${workspaces.length}` },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FF3B30]/8 border border-[#FF3B30]/15 flex items-center justify-center shrink-0">{s.icon}</div>
              <div>
                <p className="text-gray-500 text-xs">{s.label}</p>
                <p className="text-white font-bold text-sm">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 0.3s" }}>
          <div className="flex items-center justify-between mb-1">
            <div className="section-marker">Agent Skills</div>
            <a href="/dashboard/marketplace" className="text-xs text-[#FF3B30] hover:underline flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Browse Marketplace
            </a>
          </div>
          <p className="text-gray-500 text-sm mb-5">These skills activate once your agent is connected.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SKILLS.map((skill, i) => (
              <div key={skill.name} className="glass-card rounded-xl p-5 group relative overflow-hidden"
                style={{ opacity: visible ? 1 : 0, transition: `opacity 0.5s ease ${0.35 + i * 0.06}s` }}>
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#FF3B30] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,190,0,0.08)", color: "#FFBE00", border: "0.5px solid rgba(255,190,0,0.2)" }}>
                  Soon
                </span>
                <div className="w-11 h-11 rounded-xl bg-[#FF3B30]/8 border border-[#FF3B30]/15 flex items-center justify-center mb-4 group-hover:bg-[#FF3B30]/14 transition-all">
                  {skill.icon}
                </div>
                <h3 className="text-white font-bold text-sm mb-1">{skill.name}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{skill.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-700 text-xs">
            Questions?{" "}
            <a href="mailto:hello@vnus.ai" className="text-[#FF3B30] hover:underline">hello@vnus.ai</a>
          </p>
        </div>
      </main>

      <SetUpAgentModal   isOpen={setupOpen}     onClose={() => setSetupOpen(false)} />
      <AddWorkspaceModal isOpen={workspaceOpen} onClose={() => setWorkspaceOpen(false)} onConnected={handleWorkspaceConnected} />
    </div>
  );
}