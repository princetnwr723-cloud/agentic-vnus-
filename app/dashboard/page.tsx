"use client";
// app/dashboard/page.tsx — Fixed disconnect + workspace query
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import DemonMascot from "@/components/DemonMascot";
import SetUpAgentModal from "@/components/SetUpAgentModal";
import AddWorkspaceModal, { WorkspaceData } from "@/components/AddWorkspaceModal";
import PricingModal from "@/components/PricingModal";
import toast from "react-hot-toast";

const PLAN_META: Record<string, { label: string; color: string; tokenLimit: number }> = {
  free:        { label: "Free",        color: "#6b7280", tokenLimit: 200_000    },
  starter:     { label: "Starter",     color: "#6b7280", tokenLimit: 1_000_000  },
  pro:         { label: "Pro",         color: "#FF3B30", tokenLimit: 2_000_000  },
  pro_max:     { label: "Pro Max",     color: "#FF3B30", tokenLimit: 5_000_000  },
  elite:       { label: "Elite",       color: "#a855f7", tokenLimit: 20_000_000 },
  elite_ultra: { label: "Elite Ultra", color: "#a855f7", tokenLimit: 40_000_000 },
};

const SKILLS = [
  { name: "Email Agent",     desc: "Clear inbox, send & reply automatically" },
  { name: "Calendar Agent",  desc: "Schedule meetings, set reminders" },
  { name: "Web Browsing",    desc: "Navigate any website, fill forms, extract data" },
  { name: "Task Manager",    desc: "Create Notion pages, Jira tickets, Trello cards" },
  { name: "Flight Check-in", desc: "Auto check-in the moment the window opens" },
  { name: "Chat Control",    desc: "Control your agent from WhatsApp, Telegram & more" },
];

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

function WorkspaceCard({
  workspace,
  onDisconnect,
}: {
  workspace: WorkspaceData;
  onDisconnect: (id: string) => void;
}) {
  return (
    <div className="glass-card rounded-xl p-5 group relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(255,59,48,0.3),transparent)" }} />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#FF3B30]/8 border border-[#FF3B30]/15 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-sm truncate">{workspace.pcName}</h3>
              <div className={`w-2 h-2 rounded-full shrink-0 ${workspace.status === "online" ? "bg-green-400" : "bg-gray-600"}`}
                style={workspace.status === "online" ? { boxShadow: "0 0 6px #4ade80" } : {}} />
            </div>
            <p className="text-gray-500 text-xs mt-0.5">{workspace.os}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${workspace.status === "online" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-white/5 text-gray-500 border border-white/10"}`}>
          {workspace.status === "online" ? "Online" : "Offline"}
        </span>
      </div>
      <div className="mt-4 flex gap-2">
        <a href={`/dashboard/workspace/${workspace.id}`}
          className="btn-primary flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Open Agent
        </a>
        <button onClick={() => onDisconnect(workspace.id)}
          className="px-3 py-2 rounded-lg text-xs font-semibold text-gray-500 hover:text-red-400 border border-white/8 hover:border-red-500/20 transition-all">
          Disconnect
        </button>
      </div>
    </div>
  );
}

function PlanUsageCard({ planKey, tokensUsed, onUpgradeClick }: {
  planKey: string; tokensUsed: number; onUpgradeClick: () => void;
}) {
  const plan = PLAN_META[planKey] ?? PLAN_META["free"];
  const pct  = Math.min(100, Math.round((tokensUsed / plan.tokenLimit) * 100));
  return (
    <div className="rounded-xl border p-4" style={{ background: `${plan.color}08`, borderColor: `${plan.color}30` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${plan.color}18`, color: plan.color, border: `1px solid ${plan.color}35` }}>
            {plan.label}
          </span>
          <span className="text-gray-500 text-xs">plan</span>
        </div>
        <button onClick={onUpgradeClick} className="text-xs font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: plan.color }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          Upgrade
        </button>
      </div>
      <div className="mb-1.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-500 text-xs">Tokens used</span>
          <span className="text-gray-400 text-xs">{fmtTokens(tokensUsed)} / {fmtTokens(plan.tokenLimit)}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/8 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: pct > 80 ? "linear-gradient(90deg,#FF3B30,#CC1A10)" : `linear-gradient(90deg,${plan.color},${plan.color}88)` }} />
        </div>
      </div>
      <p className="text-gray-600 text-xs">{pct}% used · resets monthly</p>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [greeting,      setGreeting]      = useState("Hello");
  const [userData,      setUserData]      = useState<{ name?: string; profession?: string; plan?: string; tokensUsed?: number } | null>(null);
  const [fetchDone,     setFetchDone]     = useState(false);
  const [visible,       setVisible]       = useState(false);
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [setupOpen,     setSetupOpen]     = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [pricingOpen,   setPricingOpen]   = useState(false);
  const [workspaces,    setWorkspaces]    = useState<WorkspaceData[]>([]);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening");
  }, []);

  useEffect(() => {
    if (!loading && !user) window.location.href = "/";
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;

    getDoc(doc(db, "users", user.uid))
      .then((snap) => {
        if (snap.exists()) {
          setUserData(snap.data() as { name: string; profession: string; plan?: string; tokensUsed?: number });
        } else {
          window.location.href = "/onboarding";
        }
      })
      .catch(() => setUserData({ name: user.displayName || "", profession: "" }))
      .finally(() => { setFetchDone(true); setTimeout(() => setVisible(true), 50); });

    // ── FIXED: userId != null aur status = connected dono check karo ──
    getDocs(query(
      collection(db, "agent_connections"),
      where("userId", "==", user.uid),
      where("status", "==", "connected"),
    ))
      .then((snap) => {
        setWorkspaces(snap.docs.map((d) => ({
          id:          d.id,
          code:        d.data().code,
          pcName:      d.data().pcName || "My PC",
          os:          d.data().os     || "Unknown OS",
          status:      "offline" as const,
          connectedAt: d.data().connectedAt,
        })));
      })
      .catch(() => {});
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Signed out!");
    window.location.href = "/";
  };

  const handleDisconnect = async (id: string) => {
    if (!user) return;
    const confirmed = window.confirm("Disconnect this workspace? The agent on your PC will stop.");
    if (!confirmed) return;

    try {
      const token = await auth.currentUser?.getIdToken();
      const res   = await fetch("/api/disconnect-workspace", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ workspaceId: id }),
      });

      if (res.ok) {
        // ── FIXED: UI se turant remove karo, reload pe wapas nahi aayega ──
        setWorkspaces(prev => prev.filter(w => w.id !== id));
        toast.success("Workspace disconnected!");
      } else {
        toast.error("Failed to disconnect. Try again.");
      }
    } catch {
      toast.error("Network error. Try again.");
    }
  };

  const handleWorkspaceConnected = (ws: WorkspaceData) =>
    setWorkspaces((prev) => [...prev, ws]);

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
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        {Array.from({ length: 80 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white" style={{
            width: `${Math.random() * 1.5 + 0.4}px`, height: `${Math.random() * 1.5 + 0.4}px`,
            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.1,
            animation: `starTwinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }} />
        ))}
      </div>
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse 70% 35% at 50% 0%, rgba(120,15,15,0.15) 0%, transparent 70%)" }}
        aria-hidden />

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
            <span className="font-bold text-white text-sm group-hover:text-[#FF3B30] transition-colors">Agentic Vnus</span>
          </a>
          <div className="flex items-center gap-3">
            <button onClick={() => setPricingOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: `${planMeta.color}12`, color: planMeta.color, borderColor: `${planMeta.color}30` }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              {planMeta.label}
            </button>
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#FF3B30]/20 bg-[#FF3B30]/8 hover:bg-[#FF3B30]/12 transition-all">
                <div className="w-6 h-6 rounded-full bg-[#FF3B30] flex items-center justify-center text-xs font-bold">{initials}</div>
                <span className="text-sm font-medium max-w-[80px] truncate">{displayName}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-white/8 overflow-hidden shadow-2xl z-50"
                  style={{ background: "rgba(8,4,4,0.98)" }}>
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-white text-xs font-semibold truncate">{displayName}</p>
                    {userData?.profession && <p className="text-gray-500 text-xs mt-0.5">{userData.profession}</p>}
                  </div>
                  <button onClick={() => { setDropdownOpen(false); setPricingOpen(true); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#FF3B30] hover:bg-white/5 transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    Upgrade Plan
                  </button>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-10"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
          <div className="shrink-0 relative">
            <DemonMascot size={130} />
          </div>
          <div className="flex-1">
            <p className="text-gray-500 text-sm mb-1">{greeting},</p>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{displayName} 👋</h1>
            {userData?.profession && (
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3"
                style={{ background: "rgba(255,59,48,0.1)", color: "#FF3B30", border: "1px solid rgba(255,59,48,0.2)" }}>
                {userData.profession}
              </span>
            )}
            <p className="text-gray-500 text-sm leading-relaxed max-w-md">
              Your Agentic Vnus dashboard. Set up your agent and connect your PC to get started.
            </p>
          </div>
          <div className="w-full md:w-64 shrink-0">
            <PlanUsageCard planKey={planKey} tokensUsed={tokensUsed} onUpgradeClick={() => setPricingOpen(true)} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-10" style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 0.1s" }}>
          <button onClick={() => setSetupOpen(true)}
            className="btn-primary px-5 py-2.5 rounded-xl text-white font-bold text-sm flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            Set Up Agent
          </button>
          <button onClick={() => setWorkspaceOpen(true)}
            className="btn-ghost px-5 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Add Workspace
          </button>
          <button onClick={() => setPricingOpen(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
            style={{ background: `${planMeta.color}15`, color: planMeta.color, border: `1px solid ${planMeta.color}30` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            Upgrade Plan
          </button>
        </div>

        {/* Workspaces */}
        <div className="mb-10" style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 0.15s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="section-marker">Workspaces</div>
            <button onClick={() => setWorkspaceOpen(true)} className="text-xs text-[#FF3B30] hover:underline flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Workspace
            </button>
          </div>
          {workspaces.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
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
              {workspaces.map((ws) => (
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

        {/* Skills */}
        <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 0.3s" }}>
          <div className="section-marker">Agent Skills</div>
          <p className="text-gray-500 text-sm mb-5">These skills activate once your agent is connected.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SKILLS.map((skill) => (
              <div key={skill.name} className="glass-card rounded-xl p-5 group relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-[#FF3B30] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,190,0,0.08)", color: "#FFBE00", border: "0.5px solid rgba(255,190,0,0.2)" }}>
                  Soon
                </span>
                <div className="w-11 h-11 rounded-xl bg-[#FF3B30]/8 border border-[#FF3B30]/15 flex items-center justify-center mb-4 group-hover:bg-[#FF3B30]/14 transition-all">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <h3 className="text-white font-bold text-sm mb-1">{skill.name}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{skill.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-700 text-xs">Questions? <a href="mailto:hello@agenticvnus.com" className="text-[#FF3B30] hover:underline">hello@agenticvnus.com</a></p>
        </div>
      </main>

      <SetUpAgentModal isOpen={setupOpen} onClose={() => setSetupOpen(false)} />
      <AddWorkspaceModal isOpen={workspaceOpen} onClose={() => setWorkspaceOpen(false)} onConnected={handleWorkspaceConnected} />
      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} currentPlan={planKey} showContinue={true} onPlanChosen={(pk) => setPricingOpen(false)} />
    </div>
  );
}