"use client";
import { useState, useEffect, useRef } from "react";
import { ref, onValue, set } from "firebase/database";
import { rtdb } from "@/lib/firebase";

interface Agent {
  role: string;
  name: string;
  emoji: string;
  status: "waiting" | "working" | "done" | "error";
  output?: string;
}

interface TeamProgress {
  teamId: string;
  phase: string;
  message: string;
  teamName?: string;
  agents: Agent[];
  finalOutput?: string;
  estimatedTime?: string;
  status: "working" | "done";
  currentAgent?: string;
  latestOutput?: string;
}

export default function MultiAgentSection({ workspaceId }: { workspaceId: string }) {
  const [teamProgress, setTeamProgress] = useState<TeamProgress | null>(null);
  const [history, setHistory]           = useState<TeamProgress[]>([]);
  const [expanded, setExpanded]         = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rtdb) return;
    const r = ref(rtdb, `workspaces/${workspaceId}/teamProgress`);
    const unsub = onValue(r, snap => {
      const d = snap.val();
      if (!d) return;
      setTeamProgress(d);
      if (d.status === "done" && d.finalOutput) {
        setHistory(prev => {
          const exists = prev.find(h => h.teamId === d.teamId);
          if (exists) return prev;
          return [d, ...prev].slice(0, 20);
        });
      }
    });
    return () => unsub();
  }, [workspaceId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [teamProgress?.agents]);

  const statusColor = (s: string) =>
    s === "done" ? "#4ade80" : s === "working" ? "#FF3B30" : s === "error" ? "#f87171" : "#333";

  const statusIcon = (s: string) =>
    s === "done" ? "✅" : s === "working" ? "⚡" : s === "error" ? "❌" : "⏳";

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
            Multi-Agent Teams
          </h2>
          <p style={{ fontSize: 12, color: "#444" }}>
            Complex tasks automatically assemble a team of specialized AI agents
          </p>
        </div>
        {teamProgress?.status === "working" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: "rgba(255,59,48,.1)", border: "1px solid rgba(255,59,48,.25)" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF3B30", boxShadow: "0 0 6px #FF3B30", animation: "pulse 1s infinite" }} />
            <span style={{ fontSize: 12, color: "#FF3B30", fontWeight: 700 }}>Team Active</span>
          </div>
        )}
      </div>

      {/* Active Team */}
      {teamProgress && (
        <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,59,48,.15)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
                {teamProgress.teamName || "Active Team"}
              </div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
                {teamProgress.message}
              </div>
            </div>
            {teamProgress.estimatedTime && (
              <div style={{ fontSize: 11, color: "#444", background: "rgba(255,255,255,.04)", padding: "4px 10px", borderRadius: 20, border: "1px solid #1a1a1a" }}>
                ~{teamProgress.estimatedTime}
              </div>
            )}
          </div>

          {/* Agents Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 14 }}>
            {teamProgress.agents.map(agent => (
              <div key={agent.role}
                onClick={() => setExpanded(expanded === agent.role ? null : agent.role)}
                style={{
                  background: agent.status === "working" ? "rgba(255,59,48,.07)" : agent.status === "done" ? "rgba(74,222,128,.05)" : "rgba(255,255,255,.02)",
                  border: `1px solid ${agent.status === "working" ? "rgba(255,59,48,.3)" : agent.status === "done" ? "rgba(74,222,128,.2)" : "#1a1a1a"}`,
                  borderRadius: 10, padding: "10px 12px", cursor: "pointer", transition: "all .2s",
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 16 }}>{agent.emoji}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: statusColor(agent.status), textTransform: "uppercase", letterSpacing: ".06em" }}>
                    {statusIcon(agent.status)} {agent.status}
                  </span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#ddd" }}>{agent.name}</div>
                {agent.status === "working" && (
                  <div style={{ display: "flex", gap: 3, marginTop: 6 }}>
                    {[0, .2, .4].map((d, i) => (
                      <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF3B30", animation: `bounce 1s ${d}s infinite` }} />
                    ))}
                  </div>
                )}
                {/* Expanded output */}
                {expanded === agent.role && agent.output && (
                  <div style={{ marginTop: 8, fontSize: 10, color: "#666", lineHeight: 1.6, borderTop: "1px solid #1a1a1a", paddingTop: 8, maxHeight: 100, overflow: "auto" }}>
                    {agent.output.slice(0, 300)}...
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final Output */}
          {teamProgress.status === "done" && teamProgress.finalOutput && (
            <div style={{ background: "rgba(74,222,128,.04)", border: "1px solid rgba(74,222,128,.15)", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".08em" }}>
                ✅ Team Complete — Final Output
              </div>
              <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.7, whiteSpace: "pre-wrap", maxHeight: 200, overflow: "auto" }}>
                {teamProgress.finalOutput}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* How It Works */}
      {!teamProgress && (
        <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid #1a1a1a", borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd", marginBottom: 12 }}>How Teams Work</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { emoji: "🧠", title: "Boss Agent", desc: "Analyzes your task and selects the best team automatically" },
              { emoji: "⚡", title: "Parallel Work", desc: "Agents work simultaneously — 5x faster than one agent" },
              { emoji: "🔗", title: "Chain Results", desc: "Each agent builds on previous agent's output for best quality" },
              { emoji: "✅", title: "Editor Review", desc: "Final agent reviews everything before delivering to you" },
            ].map(item => (
              <div key={item.title} style={{ background: "rgba(255,255,255,.02)", border: "1px solid #111", borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{item.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#ccc", marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: "#444", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Templates */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#333", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
          Available Teams — Just describe the task
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { emoji: "📝", name: "Content Creation Team", agents: "Research → Write → Edit", example: '"Write a blog post about AI trends"' },
            { emoji: "🚀", name: "Marketing Campaign Team", agents: "Research → Strategy → Marketing → Write → Edit", example: '"Create a full launch campaign"' },
            { emoji: "🛠️", name: "Software Dev Team", agents: "Plan → Code → Review", example: '"Build a user auth system"' },
            { emoji: "📧", name: "Sales Outreach Team", agents: "Research → Sales → Edit", example: '"Write outreach sequence for SaaS founders"' },
            { emoji: "♟️", name: "Strategy Team", agents: "Research → Analyze → Strategize", example: '"Plan our Q4 growth strategy"' },
          ].map(t => (
            <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,.02)", border: "1px solid #111", borderRadius: 10, padding: "10px 14px" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{t.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#ccc" }}>{t.name}</div>
                <div style={{ fontSize: 10, color: "#333", marginTop: 1 }}>{t.agents}</div>
              </div>
              <div style={{ fontSize: 10, color: "#555", fontStyle: "italic", textAlign: "right", flexShrink: 0, maxWidth: 160 }}>
                {t.example}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#333", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
            Team History
          </div>
          {history.map(h => (
            <div key={h.teamId} style={{ background: "rgba(255,255,255,.02)", border: "1px solid #111", borderRadius: 10, padding: 12, marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#aaa" }}>{h.teamName}</span>
                <span style={{ fontSize: 10, color: "#4ade80" }}>✅ Complete</span>
                <span style={{ fontSize: 10, color: "#333", marginLeft: "auto" }}>
                  {h.agents?.length} agents
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#555", lineHeight: 1.6, maxHeight: 60, overflow: "hidden" }}>
                {h.finalOutput?.slice(0, 200)}...
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes bounce { 0%,80%,100%{transform:scale(.5);opacity:.3} 40%{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  );
}