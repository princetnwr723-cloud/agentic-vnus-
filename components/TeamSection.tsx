"use client";
import { useState, useEffect, useRef } from "react";
import { ref, onValue, set, push } from "firebase/database";
import { rtdb } from "@/lib/firebase";

interface Agent {
  id: string;
  name: string;
  emoji: string;
  color: string;
  role: string;
  description: string;
  totalTasks: number;
  preferences: number;
  skills: number;
  schedules: number;
  lastActive: string | null;
  isDefault: boolean;
}

interface LogEntry {
  id: string;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  action: string;
  detail: string;
  timeAgo: string;
  timestamp: string;
}

interface Message {
  role: "user" | "agent" | "system";
  content: string;
  timestamp: number;
}

const ACTION_LABELS: Record<string, string> = {
  started_task:      "Started task",
  completed_task:    "Completed task",
  task_failed:       "Task failed",
  direct_chat:       "Chat message",
  trained:           "Training received",
  skill_added:       "Skill installed",
  scheduled:         "New schedule",
  received_task:     "Received task",
  routing_decision:  "Routing decision",
  compiled_results:  "Compiled results",
  requested_help:    "Requested help",
  helped_agent:      "Helped teammate",
};

const ACTION_COLORS: Record<string, string> = {
  completed_task:   "#4ade80",
  task_failed:      "#f87171",
  trained:          "#fbbf24",
  skill_added:      "#a78bfa",
  routing_decision: "#60a5fa",
  helped_agent:     "#34d399",
  started_task:     "#FF3B30",
};

export default function TeamSection({ workspaceId }: { workspaceId: string }) {
  const [agents,       setAgents]       = useState<Agent[]>([]);
  const [log,          setLog]          = useState<LogEntry[]>([]);
  const [activeAgent,  setActiveAgent]  = useState<Agent | null>(null);
  const [messages,     setMessages]     = useState<Message[]>([]);
  const [input,        setInput]        = useState("");
  const [sending,      setSending]      = useState(false);
  const [view,         setView]         = useState<"team"|"chat"|"log">("team");
  const [trainInput,   setTrainInput]   = useState("");
  const [showTrain,    setShowTrain]    = useState(false);
  const [teamProgress, setTeamProgress] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load agents + log from RTDB
  useEffect(() => {
    if (!rtdb) return;
    const unsub1 = onValue(ref(rtdb, `workspaces/${workspaceId}/agentStatuses`), snap => {
      const d = snap.val();
      if (d) setAgents(Array.isArray(d) ? d : Object.values(d));
    });
    const unsub2 = onValue(ref(rtdb, `workspaces/${workspaceId}/activityLog`), snap => {
      const d = snap.val();
      if (d) setLog(Array.isArray(d) ? d : Object.values(d));
    });
    const unsub3 = onValue(ref(rtdb, `workspaces/${workspaceId}/teamProgress`), snap => {
      const d = snap.val();
      if (d) setTeamProgress(d);
    });
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [workspaceId]);

  // Load chat when agent selected
  useEffect(() => {
    if (!activeAgent || !rtdb) return;
    const unsub = onValue(ref(rtdb, `workspaces/${workspaceId}/agentChats/${activeAgent.id}`), snap => {
      const d = snap.val();
      if (!d) { setMessages([]); return; }
      const list: Message[] = Object.values(d);
      list.sort((a: any, b: any) => a.timestamp - b.timestamp);
      setMessages(list);
    });
    return () => unsub();
  }, [activeAgent, workspaceId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectAgent = (agent: Agent) => {
    setActiveAgent(agent);
    setView("chat");
    setShowTrain(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending || !activeAgent || !rtdb) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    // Add user message
    await push(ref(rtdb, `workspaces/${workspaceId}/agentChats/${activeAgent.id}`), {
      role: "user", content, timestamp: Date.now(),
    });

    // Add thinking message
    const thinkRef = await push(ref(rtdb, `workspaces/${workspaceId}/agentChats/${activeAgent.id}`), {
      role: "agent", content: "...", timestamp: Date.now() + 1, status: "thinking",
    });

    // Send command to agent
    await set(ref(rtdb, `workspaces/${workspaceId}/agentDirectChat`), {
      agentId:   activeAgent.id,
      message:   content,
      messageId: thinkRef.key,
      sentAt:    Date.now(),
    });

    setSending(false);
  };

  const sendTraining = async () => {
    if (!trainInput.trim() || !activeAgent || !rtdb) return;
    await set(ref(rtdb, `workspaces/${workspaceId}/agentDirectChat`), {
      agentId:  activeAgent.id,
      message:  `train: ${trainInput.trim()}`,
      sentAt:   Date.now(),
    });
    setTrainInput("");
    setShowTrain(false);
  };

  const sendToMainAgent = async (text: string) => {
    if (!rtdb) return;
    await set(ref(rtdb, `workspaces/${workspaceId}/commands/cmd_${Date.now()}`), {
      command:  text,
      status:   "pending",
      isTeam:   true,
      sentAt:   Date.now(),
    });
  };

  const s = (obj: React.CSSProperties) => obj;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>

      {/* ── Left: Agent List ── */}
      <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid #1a1a1a", display: "flex", flexDirection: "column", background: "rgba(8,4,4,.98)" }}>

        {/* Header */}
        <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginBottom: 2 }}>Agent Team</div>
          <div style={{ fontSize: 10, color: "#333" }}>{agents.length} members active</div>
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 4, padding: "8px 10px", borderBottom: "1px solid #1a1a1a" }}>
          {(["team", "log"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ flex: 1, padding: "5px 0", borderRadius: 6, border: "none", background: view === v ? "#FF3B30" : "rgba(255,255,255,.04)", color: view === v ? "#fff" : "#444", fontSize: 10, fontWeight: 700, cursor: "pointer", textTransform: "capitalize" }}>
              {v === "team" ? "👥 Team" : "📋 Log"}
            </button>
          ))}
        </div>

        {/* Agent list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px" }}>
          {view === "team" && (
            <>
              {/* Boss Agent first */}
              {agents.filter(a => a.isDefault).map(agent => (
                <AgentCard key={agent.id} agent={agent} active={activeAgent?.id === agent.id} onClick={() => selectAgent(agent)} />
              ))}
              <div style={{ height: 1, background: "#111", margin: "6px 4px" }} />
              <div style={{ fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: ".1em", padding: "2px 4px 4px" }}>Specialists</div>
              {agents.filter(a => !a.isDefault).map(agent => (
                <AgentCard key={agent.id} agent={agent} active={activeAgent?.id === agent.id} onClick={() => selectAgent(agent)} />
              ))}
            </>
          )}

          {/* Activity Log */}
          {view === "log" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {log.length === 0 && (
                <div style={{ textAlign: "center", padding: 20, fontSize: 11, color: "#333" }}>No activity yet</div>
              )}
              {log.map(entry => (
                <div key={entry.id} style={{ padding: "7px 8px", borderRadius: 7, background: "rgba(255,255,255,.02)", border: "1px solid #0d0d0d" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                    <span style={{ fontSize: 12 }}>{entry.agentEmoji}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: ACTION_COLORS[entry.action] || "#555" }}>
                      {ACTION_LABELS[entry.action] || entry.action}
                    </span>
                    <span style={{ fontSize: 9, color: "#2a2a2a", marginLeft: "auto" }}>{entry.timeAgo}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "#444", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.detail}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ padding: "8px 10px", borderTop: "1px solid #1a1a1a" }}>
          <button onClick={() => sendToMainAgent("Assemble my full team for today's tasks")}
            style={{ width: "100%", padding: "7px 0", borderRadius: 7, border: "1px solid rgba(255,59,48,.2)", background: "rgba(255,59,48,.07)", color: "#FF3B30", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
            👑 Assemble Full Team
          </button>
        </div>
      </div>

      {/* ── Right: Chat / Team Overview ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* No agent selected */}
        {!activeAgent && (
          <TeamOverview agents={agents} teamProgress={teamProgress} onSelectAgent={selectAgent} onQuickTask={sendToMainAgent} />
        )}

        {/* Agent Chat */}
        {activeAgent && view === "chat" && (
          <>
            {/* Agent header */}
            <div style={{ padding: "12px 18px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 12, background: "rgba(8,4,4,.9)", flexShrink: 0 }}>
              <button onClick={() => { setActiveAgent(null); setView("team"); }}
                style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>←</button>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${activeAgent.color}15`, border: `1px solid ${activeAgent.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {activeAgent.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{activeAgent.name}</div>
                <div style={{ fontSize: 10, color: activeAgent.color }}>{activeAgent.role}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setShowTrain(!showTrain)}
                  style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #1a1a1a", background: showTrain ? "rgba(251,191,36,.1)" : "rgba(255,255,255,.03)", color: showTrain ? "#fbbf24" : "#555", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                  🎓 Train
                </button>
                <div style={{ fontSize: 10, color: "#333", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: "#555" }}>Tasks:</span>
                  <span style={{ color: "#aaa", fontWeight: 700 }}>{activeAgent.totalTasks}</span>
                </div>
              </div>
            </div>

            {/* Train input */}
            {showTrain && (
              <div style={{ padding: "10px 18px", borderBottom: "1px solid #1a1a1a", background: "rgba(251,191,36,.04)" }}>
                <div style={{ fontSize: 10, color: "#fbbf24", marginBottom: 6, fontWeight: 700 }}>
                  🎓 Train {activeAgent.name} — this instruction will be permanent
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={trainInput} onChange={e => setTrainInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") sendTraining(); }}
                    placeholder={`e.g. "Always include Indian market data" or "Focus on B2B SaaS customers"`}
                    style={{ flex: 1, background: "#0d0d0d", border: "1px solid rgba(251,191,36,.2)", borderRadius: 7, padding: "7px 12px", color: "#ddd", fontSize: 12, outline: "none", fontFamily: "inherit" }}
                  />
                  <button onClick={sendTraining} disabled={!trainInput.trim()}
                    style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: "rgba(251,191,36,.8)", color: "#000", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    Save
                  </button>
                </div>
                <div style={{ fontSize: 10, color: "#555", marginTop: 5 }}>
                  Or type <code style={{ background: "#111", padding: "0 4px", borderRadius: 3 }}>train: your instruction</code> in chat
                </div>
              </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: "center", paddingTop: 40 }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{activeAgent.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd", marginBottom: 6 }}>{activeAgent.name}</div>
                  <div style={{ fontSize: 12, color: "#333", marginBottom: 20 }}>{activeAgent.description}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                    {getQuickCommands(activeAgent.id).map(cmd => (
                      <button key={cmd} onClick={() => setInput(cmd)}
                        style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${activeAgent.color}25`, background: `${activeAgent.color}08`, color: activeAgent.color, fontSize: 11, cursor: "pointer" }}>
                        {cmd}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", gap: 8, flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-end" }}>
                  {msg.role === "agent" && (
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: `${activeAgent.color}15`, border: `1px solid ${activeAgent.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                      {activeAgent.emoji}
                    </div>
                  )}
                  <div style={{
                    padding: "9px 13px",
                    borderRadius: msg.role === "user" ? "10px 10px 2px 10px" : msg.role === "system" ? "8px" : "10px 10px 10px 2px",
                    fontSize: 12, lineHeight: 1.65, maxWidth: "76%", whiteSpace: "pre-line",
                    background: msg.role === "user" ? `${activeAgent.color}12` : msg.role === "system" ? "transparent" : "#0d0d0d",
                    border: msg.role === "user" ? `1px solid ${activeAgent.color}22` : msg.role === "system" ? "none" : "1px solid #1a1a1a",
                    color: msg.role === "user" ? "#ddd" : msg.role === "system" ? "#333" : "#bbb",
                    textAlign: msg.role === "system" ? "center" : "left",
                  }}>
                    {(msg as any).status === "thinking" ? (
                      <div style={{ display: "flex", gap: 3 }}>
                        {[0, .2, .4].map((d, i) => (
                          <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: activeAgent.color, animation: `bounce 1s ${d}s infinite` }} />
                        ))}
                      </div>
                    ) : msg.content}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "10px 14px", borderTop: "1px solid #1a1a1a", background: "rgba(8,4,4,.95)", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={`Message ${activeAgent.name}... (train: for training, schedule: for cron jobs)`}
                  rows={1}
                  style={{ flex: 1, background: "#0c0c0c", border: "1px solid #1a1a1a", borderRadius: 9, padding: "9px 13px", color: "#ddd", fontSize: 12, outline: "none", resize: "none", fontFamily: "inherit", maxHeight: 100 }}
                  onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 100) + "px"; }}
                />
                <button onClick={sendMessage} disabled={!input.trim() || sending}
                  style={{ width: 36, height: 36, borderRadius: 9, border: "none", background: `linear-gradient(135deg,${activeAgent.color},${activeAgent.color}cc)`, color: "#fff", cursor: "pointer", opacity: input.trim() && !sending ? 1 : .4, flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes bounce { 0%,80%,100%{transform:scale(.5);opacity:.3} 40%{transform:scale(1);opacity:1} }
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#1a1a1a;border-radius:2px}
      `}</style>
    </div>
  );
}

// ── Agent Card ─────────────────────────────────────────────
function AgentCard({ agent, active, onClick }: { agent: Agent; active: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 8px", borderRadius: 8, cursor: "pointer",
      background: active ? `${agent.color}10` : "transparent",
      border: active ? `1px solid ${agent.color}25` : "1px solid transparent",
      marginBottom: 2, transition: "all .15s",
    }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: `${agent.color}12`, border: `1px solid ${agent.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
        {agent.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: active ? "#fff" : "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{agent.name}</div>
        <div style={{ fontSize: 9, color: active ? agent.color : "#2a2a2a", marginTop: 1 }}>{agent.totalTasks} tasks</div>
      </div>
      {agent.isDefault && (
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF3B30", flexShrink: 0, boxShadow: "0 0 5px #FF3B30" }} />
      )}
    </div>
  );
}

// ── Team Overview ──────────────────────────────────────────
function TeamOverview({ agents, teamProgress, onSelectAgent, onQuickTask }: any) {
  const QUICK_TASKS = [
    { emoji: "🚀", label: "Launch Campaign",    task: "Create a full marketing campaign for my business launch" },
    { emoji: "📝", label: "Write Blog Post",     task: "Write a detailed blog post about my product's unique value" },
    { emoji: "🔍", label: "Competitor Analysis", task: "Analyze my top 3 competitors and find opportunities" },
    { emoji: "💻", label: "Build Feature",       task: "Plan and build a new feature for my product" },
    { emoji: "📧", label: "Outreach Sequence",   task: "Create a 5-step sales outreach sequence for my target customers" },
    { emoji: "📊", label: "Business Report",     task: "Generate a comprehensive business status report" },
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
      {/* Team Progress Banner */}
      {teamProgress?.status === "working" && (
        <div style={{ background: "rgba(255,59,48,.06)", border: "1px solid rgba(255,59,48,.15)", borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF3B30", boxShadow: "0 0 6px #FF3B30", animation: "pulse 1s infinite" }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: "#FF3B30" }}>Team Active — {teamProgress.teamName}</div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {teamProgress.agents?.map((a: any) => (
              <div key={a.id || a.role} style={{
                padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600,
                background: a.status === "done" ? "rgba(74,222,128,.1)" : a.status === "working" ? "rgba(255,59,48,.1)" : "rgba(255,255,255,.04)",
                color: a.status === "done" ? "#4ade80" : a.status === "working" ? "#FF3B30" : "#444",
                border: `1px solid ${a.status === "done" ? "rgba(74,222,128,.2)" : a.status === "working" ? "rgba(255,59,48,.2)" : "#111"}`,
              }}>
                {a.emoji} {a.name} {a.status === "done" ? "✅" : a.status === "working" ? "⚡" : "⏳"}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick team tasks */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#333", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
          Quick Team Tasks
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          {QUICK_TASKS.map(qt => (
            <button key={qt.label} onClick={() => onQuickTask(qt.task)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, border: "1px solid #111", background: "rgba(255,255,255,.02)", cursor: "pointer", textAlign: "left", transition: "all .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,59,48,.2)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,59,48,.04)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#111"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.02)"; }}>
              <span style={{ fontSize: 18 }}>{qt.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#888" }}>{qt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Agent cards */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#333", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
          Talk to a Specialist
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          {agents.filter((a: Agent) => !a.isDefault).map((agent: Agent) => (
            <div key={agent.id} onClick={() => onSelectAgent(agent)}
              style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #111", background: "rgba(255,255,255,.02)", cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${agent.color}30`; (e.currentTarget as HTMLDivElement).style.background = `${agent.color}06`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#111"; (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,.02)"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 18 }}>{agent.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#ccc" }}>{agent.name}</span>
              </div>
              <div style={{ fontSize: 10, color: "#444", lineHeight: 1.5 }}>{agent.description}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 9, color: "#333" }}>Tasks: <span style={{ color: "#666" }}>{agent.totalTasks}</span></span>
                <span style={{ fontSize: 9, color: "#333" }}>Skills: <span style={{ color: "#666" }}>{agent.skills}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
      `}</style>
    </div>
  );
}

// ── Quick commands per agent ───────────────────────────────
function getQuickCommands(agentId: string): string[] {
  const map: Record<string, string[]> = {
    boss:       ["What should I focus on today?", "Give me a business update", "Assemble team for marketing"],
    researcher: ["Research my top competitors", "Find market trends in my industry", "Find growth opportunities"],
    writer:     ["Write a blog post about my product", "Write 5 Twitter posts", "Write a product description"],
    developer:  ["Review my codebase architecture", "Suggest improvements to my stack", "Write a React component"],
    marketer:   ["Create a launch campaign", "Write Facebook ad copy", "Plan my content calendar"],
    analyst:    ["Analyze my business metrics", "Find patterns in my data", "Create a monthly report"],
    sales:      ["Write a cold outreach email", "Create a follow-up sequence", "Write sales objection handlers"],
    editor:     ["Review my latest blog post", "Check my email for errors", "Improve my landing page copy"],
  };
  return map[agentId] || ["How can you help me?", "What are your specialties?"];
}