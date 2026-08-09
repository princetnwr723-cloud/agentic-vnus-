"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth }        from "@/lib/AuthContext";
import { db, auth, rtdb } from "@/lib/firebase";
import { doc, getDoc }    from "firebase/firestore";
import {
  ref, onValue, push, set, serverTimestamp as rtdbTimestamp,
} from "firebase/database";
import DemonMascot       from "@/components/DemonMascot";
import PricingModal      from "@/components/PricingModal";
import BusinessDNASection from "@/components/BusinessDNASection";
import MultiAgentSection  from "@/components/MultiAgentSection";
import PlanWall          from "@/components/PlanWall";
import PermissionBanner  from "@/components/PermissionBanner";
import SchedulerSection  from "@/components/SchedulerSection";
import Link              from "next/link";

// ── Types ──────────────────────────────────────────────────
interface Message {
  id:          string;
  role:        "user" | "agent" | "system";
  content:     string;
  timestamp:   number;
  status?:     "sending" | "done" | "error";
  screenshot?: string;
}
interface Chat {
  id:          string;
  title:       string;
  skill:       string;
  lastMessage: string;
  createdAt:   number;
}
interface WorkspaceData {
  pcName:      string;
  os:          string;
  agentOnline: boolean;
  agentModel?: string;
  userId:      string;
}
interface AgentSkill {
  id:           string;
  name:         string;
  description:  string;
  trigger:      string;
  category:     string;
  successCount: number;
  lastUsed?:    string;
}
interface MemorySummary {
  totalTasks:  number;
  sessions:    number;
  factsCount:  number;
  skillsCount: number;
  userName?:   string;
}

const SKILLS_UI = [
  { id: "general",   label: "General",      desc: "Any task on your PC" },
  { id: "email",     label: "Email",         desc: "Manage Gmail / Outlook" },
  { id: "browser",   label: "Web Browser",   desc: "Browse & extract data" },
  { id: "files",     label: "File Manager",  desc: "Organize your files" },
  { id: "terminal",  label: "Terminal",      desc: "Run shell commands" },
  { id: "github",    label: "Code Repo",     desc: "GitHub operations" },
];

const SUGGESTIONS = [
  "Open Chrome and search for AI news",
  "Create a Python hello world on Desktop",
  "Take a screenshot of my screen",
  "List all files on my Desktop",
];

// ── New Chat Modal ─────────────────────────────────────────
function NewChatModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (skill: string, title: string) => void;
}) {
  const [selected, setSelected] = useState("general");
  const [title,    setTitle]    = useState("");
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"/>
      <div className="relative w-full max-w-md z-10 rounded-2xl border border-[#FF3B30]/20 overflow-hidden"
        style={{ background: "rgba(8,4,4,0.98)" }}>
        <div className="h-px" style={{ background: "linear-gradient(to right,transparent,#FF3B30,transparent)" }}/>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold text-base">New Chat Session</h2>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-white/10">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="mb-4">
            <label className="text-gray-400 text-xs mb-1.5 block">Session name</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Clear my inbox..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/50"/>
          </div>
          <div className="mb-5">
            <label className="text-gray-400 text-xs mb-2 block">Select skill</label>
            <div className="grid grid-cols-2 gap-2">
              {SKILLS_UI.map(sk => (
                <button key={sk.id} onClick={() => setSelected(sk.id)}
                  className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${selected === sk.id ? "border-[#FF3B30] bg-[#FF3B30]/10 text-white" : "border-white/8 bg-white/3 text-gray-400 hover:border-white/15 hover:text-white"}`}>
                  <div>
                    <p className="text-xs font-semibold leading-none mb-0.5">{sk.label}</p>
                    <p className="text-xs text-gray-600 leading-none">{sk.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => { onCreate(selected, title || SKILLS_UI.find(s => s.id === selected)!.label); onClose(); }}
            className="btn-primary w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function WorkspacePage({ params }: { params: { id: string } }) {
  const { user, loading }               = useAuth();
  const [workspace,     setWorkspace]   = useState<WorkspaceData | null>(null);
  const [chats,         setChats]       = useState<Chat[]>([]);
  const [activeChat,    setActiveChat]  = useState<string | null>(null);
  const [messages,      setMessages]    = useState<Message[]>([]);
  const [input,         setInput]       = useState("");
  const [sending,       setSending]     = useState(false);
  const [section,       setSection]     = useState<"chat"|"overview"|"skills"|"scheduler"|"liveview"|"settings">("chat");
  const [newChatOpen,   setNewChatOpen] = useState(false);
  const [sidebarOpen,   setSidebarOpen] = useState(true);
  const [pricingOpen,   setPricingOpen] = useState(false);
  const [userPlan,      setUserPlan]    = useState("free");
  const [disconnecting, setDisconn]     = useState(false);
  const [liveShot,      setLiveShot]    = useState<string | null>(null);
  const [liveLoading,   setLiveLoading] = useState(false);
  const [planWallDone,  setPlanWallDone]= useState(false);
  const [agentSkills,   setAgentSkills] = useState<AgentSkill[]>([]);
  const [memory,        setMemory]      = useState<MemorySummary | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAgent = typeof window !== "undefined" && !!(window as any).__VNUS_AGENT__;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (!loading && !user) window.location.href = "/"; }, [user, loading]);

  // Plan wall check
  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem(`plan_wall_done_${params.id}`) === "true") setPlanWallDone(true);
  }, [user, params.id]);

  // User plan
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (snap.exists()) setUserPlan(snap.data().plan || "free");
    });
  }, [user]);

  // Workspace from RTDB
  useEffect(() => {
    if (!user || !rtdb) return;
    const wsRef = ref(rtdb, `workspaces/${params.id}`);
    const unsub = onValue(wsRef, snap => {
      const d = snap.val();
      if (d) setWorkspace({
        pcName:      d.pcName      || "My PC",
        os:          d.os          || "Unknown",
        agentOnline: d.agentOnline || false,
        agentModel:  d.agentModel  || null,
        userId:      d.userId      || "",
      });
    });
    return () => unsub();
  }, [user, params.id]);

  // Chats from RTDB
  useEffect(() => {
    if (!user || !rtdb) return;
    const chatsRef = ref(rtdb, `workspaces/${params.id}/chats`);
    const unsub    = onValue(chatsRef, snap => {
      const data = snap.val();
      if (!data) return;
      const list: Chat[] = Object.entries(data).map(([id, v]: any) => ({
        id, title: v.title || "Untitled", skill: v.skill || "general",
        lastMessage: v.lastMessage || "", createdAt: v.createdAt || 0,
      })).sort((a, b) => b.createdAt - a.createdAt);
      setChats(list);
      if (list.length > 0 && !activeChat) setActiveChat(list[0].id);
    });
    return () => unsub();
  }, [user, params.id]);

  // Messages from RTDB
  useEffect(() => {
    if (!activeChat || !rtdb) return;
    const msgRef = ref(rtdb, `workspaces/${params.id}/chats/${activeChat}/messages`);
    const unsub  = onValue(msgRef, snap => {
      const data = snap.val();
      if (!data) { setMessages([]); return; }
      const list: Message[] = Object.entries(data).map(([id, v]: any) => ({
        id, role: v.role, content: v.content,
        timestamp: v.timestamp || 0, status: v.status || "done",
        screenshot: v.screenshot,
      })).sort((a, b) => a.timestamp - b.timestamp);
      setMessages(list);
    });
    return () => unsub();
  }, [activeChat, params.id]);

  // Live view from RTDB — FIXED
  useEffect(() => {
    if (!user || !rtdb) return;
    const liveRef = ref(rtdb, `workspaces/${params.id}/liveView`);
    const unsub   = onValue(liveRef, snap => {
      const data = snap.val();
      if (data?.screenshot) {
        setLiveShot(data.screenshot);
        setLiveLoading(false);
      }
    });
    return () => unsub();
  }, [user, params.id]);

  // Skills from RTDB — FIXED (synced from agent)
  useEffect(() => {
    if (!user || !rtdb) return;
    const skillsRef = ref(rtdb, `workspaces/${params.id}/skills`);
    const unsub     = onValue(skillsRef, snap => {
      const data = snap.val();
      if (Array.isArray(data)) setAgentSkills(data);
      else if (data && typeof data === "object") setAgentSkills(Object.values(data));
    });
    return () => unsub();
  }, [user, params.id]);

  // Memory summary from RTDB
  useEffect(() => {
    if (!user || !rtdb) return;
    const memRef = ref(rtdb, `workspaces/${params.id}/memorySummary`);
    const unsub  = onValue(memRef, snap => {
      const d = snap.val();
      if (d) setMemory(d);
    });
    return () => unsub();
  }, [user, params.id]);

  const handlePlanChosen = (planKey: string) => {
    localStorage.setItem(`plan_wall_done_${params.id}`, "true");
    setPlanWallDone(true);
    setUserPlan(planKey);
  };

  const handleDisconnect = async () => {
    if (!user || disconnecting) return;
    if (!window.confirm("Disconnect this workspace?")) return;
    setDisconn(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res   = await fetch("/api/disconnect-workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ workspaceId: params.id }),
      });
      if (res.ok) window.location.href = "/dashboard";
    } catch {}
    finally { setDisconn(false); }
  };

  const handleNewChat = async (skill: string, title: string) => {
    if (!user || !rtdb) return;
    const chatKey = `chat_${Date.now()}`;
    const chatRef = ref(rtdb, `workspaces/${params.id}/chats/${chatKey}`);
    await set(chatRef, { title, skill, lastMessage: "", createdAt: Date.now(), userId: user.uid });
    setActiveChat(chatKey);
    setSection("chat");

    const msgRef = ref(rtdb, `workspaces/${params.id}/chats/${chatKey}/messages/msg_${Date.now()}`);
    await set(msgRef, { role: "system", content: `Session started — ${title}. Type a command below.`, timestamp: Date.now(), status: "done" });
  };

  const handleSend = async () => {
    if (!input.trim() || sending || !user || !rtdb) return;

    // Auto-create chat if none selected
    if (!activeChat) {
      await handleNewChat("general", "New Session");
      return;
    }

    const content = input.trim();
    setInput("");
    setSending(true);

    // Add user message
    const userMsgKey = `msg_${Date.now()}`;
    await set(ref(rtdb, `workspaces/${params.id}/chats/${activeChat}/messages/${userMsgKey}`), {
      role: "user", content, timestamp: Date.now(), status: "done",
    });

    // Add thinking message
    const thinkKey = `msg_${Date.now() + 1}`;
    await set(ref(rtdb, `workspaces/${params.id}/chats/${activeChat}/messages/${thinkKey}`), {
      role: "agent", content: "Working on it...", timestamp: Date.now() + 1, status: "sending",
    });

    // Add command to RTDB
    const cmdKey = `cmd_${Date.now()}`;
    await set(ref(rtdb, `workspaces/${params.id}/commands/${cmdKey}`), {
      command: content, chatId: activeChat, messageId: thinkKey,
      status: "pending", createdAt: Date.now(), userId: user.uid,
    });

    setSending(false);
  };

  // Request screenshot
  const requestScreenshot = async () => {
    if (!rtdb) return;
    setLiveLoading(true);
    await set(ref(rtdb, `workspaces/${params.id}/screenshotRequest`), {
      requested: true, requestedAt: Date.now(),
    });
    // Auto-clear loading after 10s if no response
    setTimeout(() => setLiveLoading(false), 10000);
  };

  const planColor = userPlan.startsWith("elite") ? "#a855f7" : userPlan.startsWith("pro") ? "#FF3B30" : "#6b7280";
  const activeChatData = chats.find(c => c.id === activeChat);

  const SECTIONS = ["chat", "overview", "skills", "scheduler", "liveview", "settings"] as const;

  if (loading || !user) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <svg className="animate-spin w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">

      {/* Permission Banner */}
      <PermissionBanner workspaceId={params.id}/>

      {/* Plan Wall */}
      {!planWallDone && workspace && (
        <PlanWall currentPlan={userPlan} workspaceId={params.id} pcName={workspace.pcName} onPlanChosen={handlePlanChosen}/>
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-52" : "w-0"} transition-all duration-300 flex flex-col border-r border-white/5 shrink-0 overflow-hidden`}
        style={{ background: "rgba(8,4,4,0.97)" }}>

        <div className="h-12 flex items-center justify-between px-3 border-b border-white/5 shrink-0">
          {isAgent ? (
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5 shrink-0"><circle cx="16" cy="16" r="14" fill="#1a0505" stroke="#FF3B30" strokeWidth="1.5"/><path d="M11 11C10 8 12 6 13 8 14 6 15 8 14 11Z" fill="#FF3B30"/><path d="M21 11C20 8 22 6 23 8 24 6 21 8 22 11Z" fill="#FF3B30"/><circle cx="13" cy="16" r="2" fill="#FF3B30"/><circle cx="19" cy="16" r="2" fill="#FF3B30"/><circle cx="13" cy="16" r="0.9" fill="#000"/><circle cx="19" cy="16" r="0.9" fill="#000"/></svg>
              <span className="text-white font-bold text-xs">Agentic Vnus</span>
            </div>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5 shrink-0"><circle cx="16" cy="16" r="14" fill="#1a0505" stroke="#FF3B30" strokeWidth="1.5"/><path d="M11 11C10 8 12 6 13 8 14 6 15 8 14 11Z" fill="#FF3B30"/><path d="M21 11C20 8 22 6 23 8 24 6 21 8 22 11Z" fill="#FF3B30"/><circle cx="13" cy="16" r="2" fill="#FF3B30"/><circle cx="19" cy="16" r="2" fill="#FF3B30"/><circle cx="13" cy="16" r="0.9" fill="#000"/><circle cx="19" cy="16" r="0.9" fill="#000"/></svg>
              <span className="text-white font-bold text-xs group-hover:text-[#FF3B30] transition-colors truncate">Agentic Vnus</span>
            </Link>
          )}
          <div className={`w-2 h-2 rounded-full shrink-0 ${workspace?.agentOnline ? "bg-green-400" : "bg-gray-600"}`}
            style={workspace?.agentOnline ? { boxShadow: "0 0 5px #4ade80" } : {}}/>
        </div>

        {workspace && (
          <div className="px-3 py-2 border-b border-white/5">
            <p className="text-white text-xs font-semibold truncate">{workspace.pcName}</p>
            <p className="text-gray-600 text-xs">{workspace.os}</p>
            {workspace.agentModel && <p className="text-gray-700 text-xs truncate">{workspace.agentModel}</p>}
          </div>
        )}

        <div className="px-3 py-2 border-b border-white/5">
          <button onClick={() => setPricingOpen(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: `${planColor}10`, color: planColor, border: `1px solid ${planColor}25` }}>
            <span className="flex items-center gap-1.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              {userPlan.replace(/_/g, " ")} Plan
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>

        <div className="px-3 py-2.5 border-b border-white/5">
          <button onClick={() => setNewChatOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg,#FF3B30,#CC1A10)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Chat
          </button>
        </div>

        <div className="px-2 py-2 border-b border-white/5">
          {SECTIONS.filter(s => s !== "settings").map(item => (
            <button key={item} onClick={() => setSection(item)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs mb-0.5 transition-all capitalize ${section === item ? "bg-[#FF3B30]/12 text-[#FF3B30] border border-[#FF3B30]/22" : "text-gray-500 hover:text-gray-200 hover:bg-white/4"}`}>
              {item === "scheduler" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              {item}
              {item === "scheduler" && <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-[#fbbf24]/15 text-[#fbbf24] font-bold text-xs">NEW</span>}
            </button>
          ))}
        </div>

        {section === "chat" && (
          <div className="flex-1 overflow-y-auto px-2 py-2">
            <p className="text-gray-600 text-xs px-2 mb-1 uppercase tracking-wider">Sessions</p>
            {chats.length === 0
              ? <p className="text-gray-600 text-xs px-2 py-3 text-center">No sessions yet</p>
              : chats.map(chat => (
                <button key={chat.id} onClick={() => setActiveChat(chat.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left mb-0.5 transition-all ${activeChat === chat.id ? "bg-white/8 text-white" : "text-gray-500 hover:text-gray-300 hover:bg-white/4"}`}>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{chat.title}</p>
                    <p className="text-xs text-gray-600 truncate">{chat.lastMessage || "No messages"}</p>
                  </div>
                </button>
              ))
            }
          </div>
        )}

        {/* Memory stats */}
        {memory && (
          <div className="px-3 py-2 border-t border-white/5 mt-auto">
            <p className="text-gray-600 text-xs mb-1.5">Agent Memory</p>
            <div className="grid grid-cols-2 gap-1">
              {[
                { label: "Tasks", value: memory.totalTasks },
                { label: "Sessions", value: memory.sessions },
                { label: "Facts", value: memory.factsCount },
                { label: "Skills", value: agentSkills.length },
              ].map(s => (
                <div key={s.label} className="bg-white/3 rounded-lg px-2 py-1">
                  <p className="text-gray-600 text-xs leading-none">{s.label}</p>
                  <p className="text-white text-xs font-bold">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-2 py-2 border-t border-white/5 space-y-1">
          <button onClick={() => setSection("settings")}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${section === "settings" ? "bg-[#FF3B30]/12 text-[#FF3B30]" : "text-gray-500 hover:text-gray-200 hover:bg-white/4"}`}>
            Settings
          </button>
          <button onClick={handleDisconnect} disabled={disconnecting}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-600 hover:text-red-400 hover:bg-red-500/8 disabled:opacity-50 transition-all">
            {disconnecting ? "Disconnecting..." : "Disconnect"}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-white/5 shrink-0"
          style={{ background: "rgba(8,4,4,0.9)" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-white transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <h1 className="text-white font-bold text-sm capitalize">
              {section === "chat" ? (activeChatData?.title || "Chat") : section}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-white/8 bg-white/3">
              <div className={`w-1.5 h-1.5 rounded-full ${workspace?.agentOnline ? "bg-green-400" : "bg-gray-600"}`}
                style={workspace?.agentOnline ? { boxShadow: "0 0 4px #4ade80" } : {}}/>
              <span className="text-xs text-gray-400">{workspace?.agentOnline ? "Online" : "Offline"}</span>
            </div>
            <button onClick={() => setPricingOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{ background: "rgba(255,59,48,0.1)", color: "#FF3B30", border: "1px solid rgba(255,59,48,0.2)" }}>
              Upgrade
            </button>
            <button onClick={() => setNewChatOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg,#FF3B30,#CC1A10)" }}>
              + New
            </button>
          </div>
        </div>

        {/* ── CHAT ── */}
        {section === "chat" && (
          <div className="flex-1 flex flex-col min-h-0">
            {!activeChat ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <DemonMascot size={90}/>
                <div className="text-center">
                  <h2 className="text-white font-bold text-lg mb-2">Start a session</h2>
                  <p className="text-gray-500 text-sm mb-4">Create a chat to start controlling your PC</p>
                  <button onClick={() => setNewChatOpen(true)}
                    className="btn-primary px-6 py-2.5 rounded-xl text-white font-bold text-sm mx-auto flex items-center gap-2">
                    New Chat Session
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <p className="text-gray-600 text-sm mb-4">Session ready. Try a command:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {SUGGESTIONS.map(s => (
                            <button key={s} onClick={() => setInput(s)}
                              className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/4 text-gray-400 text-xs hover:border-[#FF3B30]/30 hover:text-white transition-all">
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`px-4 py-2.5 text-sm leading-relaxed max-w-[78%] ${
                        msg.role === "user"   ? "bg-[#FF3B30]/12 border border-[#FF3B30]/22 text-white rounded-2xl rounded-tr-sm" :
                        msg.role === "system" ? "bg-white/3 border border-white/6 text-gray-500 text-xs italic rounded-xl w-full text-center" :
                        "bg-white/5 border border-white/8 text-gray-200 rounded-2xl rounded-tl-sm"
                      }`}>
                        {msg.status === "sending" ? (
                          <div className="flex items-center gap-2">
                            {[0,0.2,0.4].map((d,i) => (
                              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]"
                                style={{ animation: `bounce 1.2s ease-in-out ${d}s infinite` }}/>
                            ))}
                            <span className="text-gray-500 text-xs ml-1">Working...</span>
                          </div>
                        ) : (
                          <>
                            <span>{msg.content}</span>
                            {msg.screenshot && (
                              <img src={`data:image/png;base64,${msg.screenshot}`}
                                alt="Screenshot" className="mt-2 rounded-lg max-w-full border border-white/10"/>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef}/>
                </div>
                <div className="px-4 py-3 border-t border-white/5 shrink-0" style={{ background: "rgba(8,4,4,0.9)" }}>
                  <div className="flex gap-2 items-end">
                    <textarea value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="Type a command... (Enter to send)"
                      rows={1}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/40 transition-all resize-none"
                      style={{ maxHeight: "120px" }}
                      onInput={e => {
                        const t = e.target as HTMLTextAreaElement;
                        t.style.height = "auto";
                        t.style.height = Math.min(t.scrollHeight, 120) + "px";
                      }}
                    />
                    <button onClick={handleSend} disabled={!input.trim() || sending}
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-white disabled:opacity-40 shrink-0"
                      style={{ background: "linear-gradient(135deg,#FF3B30,#CC1A10)" }}>
                      {sending
                        ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4"/></svg>
                        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      }
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── LIVE VIEW — FIXED ── */}
        {section === "liveview" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Live View</h2>
              <button onClick={requestScreenshot} disabled={liveLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#FF3B30,#CC1A10)" }}>
                {liveLoading
                  ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4"/></svg>Capturing...</>
                  : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M20 7h-3.17L15 5H9L7.17 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/></svg>Request Screenshot</>
                }
              </button>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/3 aspect-video flex items-center justify-center overflow-hidden">
              {liveShot
                ? <img src={`data:image/png;base64,${liveShot}`} alt="Live" className="w-full h-full object-contain"/>
                : (
                  <div className="text-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-3">
                      <circle cx="12" cy="12" r="3"/><path d="M20 7h-3.17L15 5H9L7.17 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                    </svg>
                    <p className="text-gray-600 text-sm mb-1">No screenshot yet</p>
                    <p className="text-gray-700 text-xs">Click "Request Screenshot" to capture your PC screen</p>
                  </div>
                )
              }
            </div>
            {liveShot && (
              <p className="text-gray-600 text-xs mt-2 text-right">
                Screenshots update automatically after each agent action
              </p>
            )}
          </div>
        )}

        {/* ── SKILLS — FIXED (from RTDB) ── */}
        {section === "skills" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold text-lg">Agent Skills</h2>
              <span className="text-gray-500 text-xs">{agentSkills.length} learned</span>
            </div>
            <p className="text-gray-500 text-sm mb-6">Skills your agent has learned from your usage — they run instantly without AI planning.</p>
            {agentSkills.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {agentSkills.map(sk => (
                  <div key={sk.id} className="glass-card rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FF3B30]/12 text-[#FF3B30]">{sk.category}</span>
                      <span className="text-gray-600 text-xs">{sk.successCount}x used</span>
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">{sk.name}</h3>
                    <p className="text-gray-500 text-xs mb-2">{sk.description}</p>
                    <p className="text-gray-700 text-xs font-mono">Trigger: "{sk.trigger}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-xl p-6 text-center mb-6">
                <p className="text-gray-500 text-sm mb-1">No skills learned yet</p>
                <p className="text-gray-600 text-xs">Complete tasks and the agent will automatically learn skills from your patterns</p>
              </div>
            )}
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Built-in Skills</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SKILLS_UI.map(sk => (
                <div key={sk.id} className="glass-card rounded-xl p-4 cursor-pointer" onClick={() => setNewChatOpen(true)}>
                  <h3 className="text-white font-bold text-sm mb-1">{sk.label}</h3>
                  <p className="text-gray-500 text-xs">{sk.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SCHEDULER ── */}
        {section === "scheduler" && <SchedulerSection workspaceId={params.id}/>}

        {/* ── OVERVIEW ── */}
        {section === "overview" && (
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-white font-bold text-lg mb-6">Workspace Overview</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: "PC Name",    value: workspace?.pcName    || "—" },
                { label: "OS",         value: workspace?.os        || "—" },
                { label: "Status",     value: workspace?.agentOnline ? "Online" : "Offline" },
                { label: "AI Model",   value: workspace?.agentModel || "—" },
                { label: "Sessions",   value: String(chats.length) },
                { label: "Tasks Done", value: String(memory?.totalTasks || 0) },
              ].map(item => (
                <div key={item.label} className="glass-card rounded-xl p-4">
                  <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                  <p className="text-white font-bold text-sm truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {section === "settings" && (
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-white font-bold text-lg mb-6">Settings</h2>
            <div className="glass-card rounded-xl p-5 mb-4">
              <h3 className="text-white font-semibold text-sm mb-2">Workspace ID</h3>
              <p className="text-gray-500 text-xs font-mono">{params.id}</p>
            </div>
            <div className="glass-card rounded-xl p-5 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold text-sm">Current Plan</h3>
                  <p className="text-white font-bold text-sm capitalize mt-1">{userPlan.replace(/_/g, " ")}</p>
                </div>
                <button onClick={() => setPricingOpen(true)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(255,59,48,0.1)", color: "#FF3B30", border: "1px solid rgba(255,59,48,0.2)" }}>
                  Upgrade
                </button>
              </div>
            </div>
            <button onClick={handleDisconnect} disabled={disconnecting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all disabled:opacity-50 mb-4">
              {disconnecting ? "Disconnecting..." : "Disconnect Workspace"}
            </button>
            {!isAgent && (
              <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                ← Back to Dashboard
              </Link>
            )}
          </div>
        )}
      </div>

      {newChatOpen && <NewChatModal onClose={() => setNewChatOpen(false)} onCreate={handleNewChat}/>}
      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} currentPlan={userPlan}
        showContinue={true} onPlanChosen={pk => { setUserPlan(pk); setPricingOpen(false); }}/>

      <style jsx>{`
        @keyframes bounce { 0%,80%,100%{transform:scale(0.5);opacity:0.4} 40%{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  );
}