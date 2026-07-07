"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import {
  doc, getDoc, collection, addDoc, query,
  orderBy, onSnapshot, serverTimestamp
} from "firebase/firestore";
import DemonMascot from "@/components/DemonMascot";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  timestamp: Date;
  status?: "sending" | "done" | "error";
  skill?: string;
}

interface Chat {
  id: string;
  title: string;
  skill: string;
  lastMessage: string;
  createdAt: Date;
}

interface WorkspaceData {
  pcName: string;
  os: string;
  status: "online" | "offline";
  userId: string;
}

// ── SVG icon set ───────────────────────────────────────────
const IC = {
  chat:       <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  overview:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  skills:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  history:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  liveview:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  settings:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>,
  plus:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  send:       <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  back:       <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  refresh:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  menu:       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  user:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  agent:      <svg viewBox="0 0 32 32" fill="none" width="14" height="14"><circle cx="16" cy="16" r="14" fill="#1a0505" stroke="#FF3B30" strokeWidth="1.5"/><path d="M11 11C10 8 12 6 13 8 14 6 15 8 14 11Z" fill="#FF3B30"/><path d="M21 11C20 8 22 6 23 8 24 6 21 8 22 11Z" fill="#FF3B30"/><circle cx="13" cy="16" r="2" fill="#FF3B30"/><circle cx="19" cy="16" r="2" fill="#FF3B30"/><circle cx="13" cy="16" r="0.9" fill="#000"/><circle cx="19" cy="16" r="0.9" fill="#000"/></svg>,

  // Skill icons
  general:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  email:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  calendar:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  browser:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  files:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  terminal:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
};

// ── Skill definitions ──────────────────────────────────────
const SKILLS = [
  { id: "general",  label: "General",      icon: IC.general,  desc: "Any task on your PC" },
  { id: "email",    label: "Email Agent",  icon: IC.email,    desc: "Manage Gmail / Outlook" },
  { id: "calendar", label: "Calendar",     icon: IC.calendar, desc: "Schedule & manage events" },
  { id: "browser",  label: "Web Browser",  icon: IC.browser,  desc: "Browse & extract data" },
  { id: "files",    label: "File Manager", icon: IC.files,    desc: "Organize your files" },
  { id: "terminal", label: "Terminal",     icon: IC.terminal, desc: "Run shell commands" },
];

const skillIcon = (id: string) => SKILLS.find(s => s.id === id)?.icon ?? IC.general;

// ── New Chat Modal ─────────────────────────────────────────
function NewChatModal({
  onClose, onCreate,
}: { onClose: () => void; onCreate: (skill: string, title: string) => void }) {
  const [selected, setSelected] = useState("general");
  const [title, setTitle] = useState("");

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-md z-10">
        <div className="absolute -inset-1 rounded-2xl opacity-20 blur-xl"
          style={{ background: "linear-gradient(135deg,#FF3B30,#CC1A10)" }} aria-hidden />
        <div className="relative rounded-2xl border border-[#FF3B30]/20 overflow-hidden"
          style={{ background: "rgba(8,4,4,0.98)" }}>
          <div className="h-px w-full"
            style={{ background: "linear-gradient(to right,transparent,#FF3B30,transparent)" }} />
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-base">New Chat Session</h2>
              <button onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="text-gray-400 text-xs mb-1.5 block">Session name (optional)</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Clear my inbox..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/50 transition-all" />
            </div>

            <div className="mb-5">
              <label className="text-gray-400 text-xs mb-2 block">Select skill</label>
              <div className="grid grid-cols-2 gap-2">
                {SKILLS.map((skill) => (
                  <button key={skill.id} onClick={() => setSelected(skill.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${
                      selected === skill.id
                        ? "border-[#FF3B30] bg-[#FF3B30]/10 text-white"
                        : "border-white/8 bg-white/3 text-gray-400 hover:border-white/15 hover:text-white"
                    }`}>
                    <span className={selected === skill.id ? "text-[#FF3B30]" : "text-gray-600"}>
                      {skill.icon}
                    </span>
                    <div>
                      <p className="text-xs font-semibold leading-none mb-0.5">{skill.label}</p>
                      <p className="text-xs text-gray-600 leading-none">{skill.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                const s = SKILLS.find(x => x.id === selected)!;
                onCreate(selected, title || s.label);
                onClose();
              }}
              className="btn-primary w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2">
              {IC.plus} Start Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Workspace Page ────────────────────────────────────
export default function WorkspacePage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [section, setSection] = useState<"chat" | "overview" | "skills" | "history" | "liveview" | "settings">("chat");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (!loading && !user) window.location.href = "/"; }, [user, loading]);

  // Load workspace
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "agent_connections", params.id)).then((snap) => {
      if (snap.exists()) {
        setWorkspace({
          pcName: snap.data().pcName || "My PC",
          os: snap.data().os || "Unknown",
          status: snap.data().status === "connected" ? "online" : "offline",
          userId: snap.data().userId,
        });
      }
    });
  }, [user, params.id]);

  // Load chats
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "agent_connections", params.id, "chats"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({
        id: d.id,
        title: d.data().title || "Untitled",
        skill: d.data().skill || "general",
        lastMessage: d.data().lastMessage || "",
        createdAt: d.data().createdAt?.toDate() || new Date(),
      }));
      setChats(list);
      if (list.length > 0 && !activeChat) setActiveChat(list[0].id);
    });
    return () => unsub();
  }, [user, params.id]);

  // Load messages
  useEffect(() => {
    if (!activeChat) return;
    const q = query(
      collection(db, "agent_connections", params.id, "chats", activeChat, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({
        id: d.id,
        role: d.data().role,
        content: d.data().content,
        timestamp: d.data().timestamp?.toDate() || new Date(),
        status: d.data().status || "done",
        skill: d.data().skill,
      })));
    });
    return () => unsub();
  }, [activeChat, params.id]);

  const handleNewChat = async (skill: string, title: string) => {
    if (!user) return;
    const ref = await addDoc(collection(db, "agent_connections", params.id, "chats"), {
      title, skill, lastMessage: "", createdAt: serverTimestamp(), userId: user.uid,
    });
    setActiveChat(ref.id);
    setSection("chat");
    await addDoc(collection(db, "agent_connections", params.id, "chats", ref.id, "messages"), {
      role: "system",
      content: `Session started — ${title}. Type a command to get started.`,
      timestamp: serverTimestamp(),
    });
  };

  const handleSend = async () => {
    if (!input.trim() || sending || !activeChat || !user) return;
    const content = input.trim();
    setInput("");
    setSending(true);
    await addDoc(collection(db, "agent_connections", params.id, "chats", activeChat, "messages"),
      { role: "user", content, timestamp: serverTimestamp(), status: "done" });
    const thinkRef = await addDoc(collection(db, "agent_connections", params.id, "chats", activeChat, "messages"),
      { role: "agent", content: "Executing on your PC...", timestamp: serverTimestamp(), status: "sending" });
    await addDoc(collection(db, "agent_connections", params.id, "commands"), {
      command: content, chatId: activeChat, messageId: thinkRef.id,
      status: "pending", createdAt: serverTimestamp(), userId: user.uid,
    });
    setSending(false);
  };

  const activeChatData = chats.find(c => c.id === activeChat);
  const activeSkill = SKILLS.find(s => s.id === activeChatData?.skill);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <svg className="animate-spin w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      </div>
    );
  }

  const logoSvg = (
    <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5 shrink-0">
      <circle cx="16" cy="16" r="14" fill="#1a0505" stroke="#FF3B30" strokeWidth="1.5"/>
      <path d="M11 11C10 8 12 6 13 8 14 6 15 8 14 11Z" fill="#FF3B30"/>
      <path d="M21 11C20 8 22 6 23 8 24 6 21 8 22 11Z" fill="#FF3B30"/>
      <circle cx="13" cy="16" r="2" fill="#FF3B30"/><circle cx="19" cy="16" r="2" fill="#FF3B30"/>
      <circle cx="13" cy="16" r="0.9" fill="#000"/><circle cx="19" cy="16" r="0.9" fill="#000"/>
    </svg>
  );

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">

      {/* ── SIDEBAR ── */}
      <div className={`${sidebarOpen ? "w-52" : "w-0"} transition-all duration-300 flex flex-col border-r border-white/5 shrink-0 overflow-hidden`}
        style={{ background: "rgba(8,4,4,0.97)" }}>

        {/* Header */}
        <div className="h-12 flex items-center justify-between px-3 border-b border-white/5 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            {logoSvg}
            <span className="text-white font-bold text-xs group-hover:text-[#FF3B30] transition-colors truncate">Vnus AI</span>
          </Link>
          <div className={`w-2 h-2 rounded-full shrink-0 ${workspace?.status === "online" ? "bg-green-400" : "bg-gray-600"}`}
            style={workspace?.status === "online" ? { boxShadow: "0 0 5px #4ade80" } : {}} />
        </div>

        {/* PC Info */}
        {workspace && (
          <div className="px-3 py-2 border-b border-white/5">
            <p className="text-white text-xs font-semibold truncate">{workspace.pcName}</p>
            <p className="text-gray-600 text-xs">{workspace.os}</p>
          </div>
        )}

        {/* New Chat */}
        <div className="px-3 py-2.5 border-b border-white/5">
          <button onClick={() => setNewChatOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg,#FF3B30,#CC1A10)" }}>
            {IC.plus} New Chat
          </button>
        </div>

        {/* Nav */}
        <div className="px-2 py-2 border-b border-white/5">
          <p className="text-gray-600 text-xs px-2 mb-1 uppercase tracking-wider">Control</p>
          {([
            { id: "chat",     label: "Chat",     icon: IC.chat },
            { id: "overview", label: "Overview", icon: IC.overview },
            { id: "skills",   label: "Skills",   icon: IC.skills },
            { id: "history",  label: "History",  icon: IC.history },
            { id: "liveview", label: "Live View",icon: IC.liveview },
          ] as const).map((item) => (
            <button key={item.id} onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs mb-0.5 transition-all ${
                section === item.id
                  ? "bg-[#FF3B30]/12 text-[#FF3B30] border border-[#FF3B30]/22"
                  : "text-gray-500 hover:text-gray-200 hover:bg-white/4"
              }`}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* Sessions list */}
        {section === "chat" && (
          <div className="flex-1 overflow-y-auto px-2 py-2">
            <p className="text-gray-600 text-xs px-2 mb-1 uppercase tracking-wider">Sessions</p>
            {chats.length === 0 ? (
              <p className="text-gray-600 text-xs px-2 py-3 text-center leading-relaxed">No sessions yet. Click New Chat!</p>
            ) : chats.map((chat) => (
              <button key={chat.id} onClick={() => setActiveChat(chat.id)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left mb-0.5 transition-all ${
                  activeChat === chat.id ? "bg-white/8 text-white" : "text-gray-500 hover:text-gray-300 hover:bg-white/4"
                }`}>
                <span className="shrink-0 text-gray-500">{skillIcon(chat.skill)}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{chat.title}</p>
                  <p className="text-xs text-gray-600 truncate">{chat.lastMessage || "No messages yet"}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Settings */}
        <div className="px-2 py-2 border-t border-white/5 mt-auto">
          <button onClick={() => setSection("settings")}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
              section === "settings" ? "bg-[#FF3B30]/12 text-[#FF3B30]" : "text-gray-500 hover:text-gray-200 hover:bg-white/4"
            }`}>
            {IC.settings} Settings
          </button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-white/5 shrink-0"
          style={{ background: "rgba(8,4,4,0.9)" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-white transition-colors">
              {IC.menu}
            </button>
            <div>
              <h1 className="text-white font-bold text-sm leading-none">
                {section === "chat" ? (activeChatData?.title || "Chat") :
                 section === "overview" ? "Overview" :
                 section === "skills" ? "Skills" :
                 section === "history" ? "History" :
                 section === "liveview" ? "Live View" : "Settings"}
              </h1>
              {section === "chat" && activeSkill && (
                <p className="text-gray-600 text-xs mt-0.5 flex items-center gap-1">
                  <span>{activeSkill.icon}</span> {activeSkill.label} active
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-white/8 bg-white/3">
              <div className={`w-1.5 h-1.5 rounded-full ${workspace?.status === "online" ? "bg-green-400" : "bg-gray-600"}`}
                style={workspace?.status === "online" ? { boxShadow: "0 0 4px #4ade80" } : {}} />
              <span className="text-xs text-gray-400">{workspace?.status === "online" ? "Online" : "Offline"}</span>
            </div>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/8 text-gray-500 hover:text-white hover:bg-white/5 transition-all">
              {IC.refresh}
            </button>
            <button onClick={() => setNewChatOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg,#FF3B30,#CC1A10)" }}>
              {IC.plus} New Session
            </button>
          </div>
        </div>

        {/* ── CHAT ── */}
        {section === "chat" && (
          <div className="flex-1 flex flex-col min-h-0">
            {!activeChat ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <DemonMascot size={100} />
                <div className="text-center">
                  <h2 className="text-white font-bold text-lg mb-2">Start a new session</h2>
                  <p className="text-gray-500 text-sm mb-5">Create a chat session to start controlling your PC</p>
                  <button onClick={() => setNewChatOpen(true)}
                    className="btn-primary px-6 py-2.5 rounded-xl text-white font-bold text-sm flex items-center gap-2 mx-auto">
                    {IC.plus} New Chat Session
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <p className="text-gray-600 text-sm mb-4">Session ready. Type a command below.</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {["Open Chrome", "Take a screenshot", "Check my emails", "Create a folder on Desktop"].map((s) => (
                            <button key={s} onClick={() => setInput(s)}
                              className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/4 text-gray-400 text-xs hover:border-[#FF3B30]/30 hover:text-white transition-all">
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                      style={{ alignSelf: msg.role === "system" ? "center" : undefined, maxWidth: msg.role === "system" ? "100%" : "78%" }}>

                      {msg.role !== "user" && msg.role !== "system" && (
                        <div className="w-7 h-7 rounded-lg bg-[#FF3B30]/12 border border-[#FF3B30]/22 flex items-center justify-center shrink-0 mt-0.5">
                          {IC.agent}
                        </div>
                      )}

                      <div className={`px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#FF3B30]/12 border border-[#FF3B30]/22 text-white rounded-2xl rounded-tr-sm"
                          : msg.role === "system"
                          ? "bg-white/3 border border-white/6 text-gray-500 text-xs italic rounded-xl"
                          : "bg-white/5 border border-white/8 text-gray-200 rounded-2xl rounded-tl-sm"
                      }`}>
                        {msg.status === "sending" ? (
                          <div className="flex items-center gap-2">
                            {[0, 0.2, 0.4].map((d, i) => (
                              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]"
                                style={{ animation: `dotBounce 1.2s ease-in-out ${d}s infinite` }} />
                            ))}
                            <span className="text-gray-500 text-xs ml-1">Agent is working...</span>
                          </div>
                        ) : msg.content}
                      </div>

                      {msg.role === "user" && (
                        <div className="w-7 h-7 rounded-lg bg-white/6 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-gray-500">
                          {IC.user}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="px-4 py-3 border-t border-white/5 shrink-0" style={{ background: "rgba(8,4,4,0.9)" }}>
                  <div className="flex gap-2 items-end">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder={`Message${activeSkill ? ` — ${activeSkill.label} active` : ""} (Enter to send)`}
                      rows={1}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/40 transition-all resize-none"
                      style={{ maxHeight: "120px" }}
                      onInput={(e) => {
                        const t = e.target as HTMLTextAreaElement;
                        t.style.height = "auto";
                        t.style.height = Math.min(t.scrollHeight, 120) + "px";
                      }}
                    />
                    <button onClick={handleSend} disabled={!input.trim() || sending}
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-white disabled:opacity-40 shrink-0 transition-all"
                      style={{ background: "linear-gradient(135deg,#FF3B30,#CC1A10)" }}>
                      {sending
                        ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>
                        : IC.send}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {section === "overview" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl">
              <h2 className="text-white font-bold text-lg mb-6">Workspace Overview</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: "PC Name",   value: workspace?.pcName || "—" },
                  { label: "OS",        value: workspace?.os || "—" },
                  { label: "Status",    value: workspace?.status === "online" ? "Online" : "Offline" },
                  { label: "Sessions",  value: String(chats.length) },
                ].map((item) => (
                  <div key={item.label} className="glass-card rounded-xl p-4">
                    <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                    <p className="text-white font-bold text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SKILLS ── */}
        {section === "skills" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl">
              <h2 className="text-white font-bold text-lg mb-2">Agent Skills</h2>
              <p className="text-gray-500 text-sm mb-6">Each skill unlocks new capabilities for your agent.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SKILLS.map((skill) => (
                  <div key={skill.id} className="glass-card rounded-xl p-5 group cursor-pointer"
                    onClick={() => setNewChatOpen(true)}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FF3B30]/8 border border-[#FF3B30]/15 flex items-center justify-center text-[#FF3B30] group-hover:bg-[#FF3B30]/14 transition-all">
                        {skill.icon}
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "rgba(255,190,0,0.08)", color: "#FFBE00", border: "0.5px solid rgba(255,190,0,0.2)" }}>
                        {skill.id === "general" ? "Active" : "Soon"}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">{skill.label}</h3>
                    <p className="text-gray-500 text-xs">{skill.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LIVE VIEW ── */}
        {section === "liveview" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-lg">Live View</h2>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white text-xs transition-all">
                  {IC.refresh} Refresh
                </button>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/3 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-600 mb-2">{IC.liveview}</div>
                  <p className="text-gray-600 text-sm">Live screenshot appears here</p>
                  <p className="text-gray-700 text-xs mt-1">Agent must be connected and online</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {section === "history" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl">
              <h2 className="text-white font-bold text-lg mb-6">Task History</h2>
              <div className="glass-card rounded-xl p-5 text-center">
                <p className="text-gray-500 text-sm">Task history appears here once your agent executes commands.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {section === "settings" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl">
              <h2 className="text-white font-bold text-lg mb-6">Workspace Settings</h2>
              <div className="glass-card rounded-xl p-5 mb-4">
                <h3 className="text-white font-semibold text-sm mb-3">Connection</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Workspace ID</p>
                    <p className="text-gray-500 text-xs font-mono mt-0.5">{params.id}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    workspace?.status === "online"
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-white/5 text-gray-500 border border-white/10"
                  }`}>
                    {workspace?.status === "online" ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
              <Link href="/dashboard"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                {IC.back} Back to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>

      {newChatOpen && (
        <NewChatModal onClose={() => setNewChatOpen(false)} onCreate={handleNewChat} />
      )}

      <style jsx>{`
        @keyframes dotBounce {
          0%,80%,100% { transform:scale(0.5); opacity:0.4; }
          40% { transform:scale(1); opacity:1; }
        }
      `}</style>
    </div>
  );
}