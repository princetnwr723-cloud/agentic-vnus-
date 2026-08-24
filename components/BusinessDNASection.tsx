"use client";
import { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { rtdb } from "@/lib/firebase";

interface DNAData {
  setupComplete: boolean;
  business?: { name: string; type: string; description: string };
  product?: { name: string; targetCustomer: string; uniqueValue: string; pricing: any[] };
  metrics?: { mrr: string; goals: any[] };
  competitors?: { name: string; weakness: string }[];
  agentRole?: string;
  agentName?: string;
  currentFocus?: string;
  marketing?: { brandVoice: string; channels: string[] };
}

interface Briefing {
  greeting: string;
  alerts: { type: string; title: string; description: string; action: string }[];
  tasksForToday: { priority: string; task: string; reason: string }[];
  strategicInsight: string;
  motivationalNote: string;
  agentName: string;
  agentRole: string;
  date: string;
}

export default function BusinessDNASection({ workspaceId }: { workspaceId: string }) {
  const [dna, setDna]               = useState<DNAData | null>(null);
  const [briefing, setBriefing]     = useState<Briefing | null>(null);
  const [setupMsg, setSetupMsg]     = useState<string | null>(null);
  const [options, setOptions]       = useState<string[] | null>(null);
  const [input, setInput]           = useState("");
  const [sending, setSending]       = useState(false);
  const [activeTab, setActiveTab]   = useState<"overview"|"briefing"|"setup">("overview");

  // Listen for DNA from RTDB
  useEffect(() => {
    if (!rtdb) return;
    const r = ref(rtdb, `workspaces/${workspaceId}/businessDNA`);
    const unsub = onValue(r, snap => {
      const d = snap.val();
      if (d) setDna(d);
    });
    return () => unsub();
  }, [workspaceId]);

  // Listen for briefing
  useEffect(() => {
    if (!rtdb) return;
    const r = ref(rtdb, `workspaces/${workspaceId}/briefing`);
    const unsub = onValue(r, snap => {
      const d = snap.val();
      if (d) setBriefing(d);
    });
    return () => unsub();
  }, [workspaceId]);

  // Listen for setup flow messages
  useEffect(() => {
    if (!rtdb) return;
    const r = ref(rtdb, `workspaces/${workspaceId}/setupFlow`);
    const unsub = onValue(r, snap => {
      const d = snap.val();
      if (d?.message) {
        setSetupMsg(d.message);
        setOptions(d.options || null);
        if (d.setupComplete && d.dna) {
          setDna(d.dna);
          setActiveTab("overview");
        }
      }
    });
    return () => unsub();
  }, [workspaceId]);

  const sendSetupAnswer = async (answer: string) => {
    if (!answer.trim() || !rtdb) return;
    setSending(true);
    setInput("");
    setOptions(null);
    await set(ref(rtdb, `workspaces/${workspaceId}/commands/setup_${Date.now()}`), {
      command: answer,
      status: "pending",
      createdAt: Date.now(),
      isSetupFlow: true,
    });
    setSending(false);
  };

  const startSetup = async () => {
    if (!rtdb) return;
    setActiveTab("setup");
    await set(ref(rtdb, `workspaces/${workspaceId}/commands/setup_${Date.now()}`), {
      command: "introduce my business",
      status: "pending",
      createdAt: Date.now(),
    });
  };

  const roleColor: Record<string, string> = {
    CEO: "#FF3B30", CMO: "#f97316", CTO: "#60a5fa",
    CFO: "#4ade80", SALES: "#a855f7", CUSTOM: "#fbbf24",
  };

  const rc = roleColor[dna?.agentRole || "CEO"] || "#FF3B30";

  return (
    <div className="flex-1 overflow-y-auto p-6">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Business DNA</h2>
          <p style={{ fontSize: 12, color: "#444" }}>Your agent's permanent business context — set once, works forever</p>
        </div>
        {dna?.setupComplete && (
          <div style={{ padding: "6px 14px", borderRadius: 20, background: `${rc}15`, border: `1px solid ${rc}30`, fontSize: 12, fontWeight: 700, color: rc }}>
            {dna.agentName} · {dna.agentRole} Mode
          </div>
        )}
      </div>

      {/* Tabs */}
      {dna?.setupComplete && (
        <div style={{ display: "flex", background: "rgba(255,255,255,.04)", borderRadius: 10, padding: 3, gap: 3, marginBottom: 20 }}>
          {(["overview", "briefing", "setup"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: activeTab === tab ? rc : "transparent", color: activeTab === tab ? "#fff" : "#555", fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "capitalize", transition: "all .2s" }}>
              {tab === "overview" ? "🧬 DNA" : tab === "briefing" ? "☀️ Briefing" : "⚙️ Update"}
            </button>
          ))}
        </div>
      )}

      {/* NOT SET UP */}
      {!dna?.setupComplete && activeTab !== "setup" && (
        <div style={{ background: "rgba(255,255,255,.02)", border: "1px dashed #1a1a1a", borderRadius: 14, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🧬</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Set Up Business DNA</div>
          <div style={{ fontSize: 13, color: "#444", lineHeight: 1.7, marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
            Introduce your business once. Your agent will remember everything forever and work as your dedicated AI executive — CEO, CMO, CTO, or any role you choose.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
            {["🧠 Remembers your business forever", "📊 Daily morning briefings", "🎯 Proactive opportunity finding", "👥 CEO/CMO/CTO role modes"].map(f => (
              <div key={f} style={{ background: "rgba(255,255,255,.03)", border: "1px solid #111", borderRadius: 8, padding: 10, fontSize: 11, color: "#666" }}>{f}</div>
            ))}
          </div>
          <button onClick={startSetup}
            style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#FF3B30,#CC1A10)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
            🧬 Introduce My Business
          </button>
          <div style={{ fontSize: 11, color: "#333", marginTop: 10 }}>Takes 5 minutes · One time only</div>
        </div>
      )}

      {/* SETUP FLOW */}
      {(activeTab === "setup" || (!dna?.setupComplete && setupMsg)) && setupMsg && (
        <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,59,48,.15)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.8, whiteSpace: "pre-line", marginBottom: 16 }}>
            {setupMsg}
          </div>

          {/* Option buttons */}
          {options && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {options.map(opt => (
                <button key={opt} onClick={() => sendSetupAnswer(opt)}
                  style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,59,48,.2)", background: "rgba(255,59,48,.07)", color: "#FF3B30", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Text input */}
          <div style={{ display: "flex", gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendSetupAnswer(input); }}}
              placeholder="Type your answer..."
              style={{ flex: 1, background: "#0c0c0c", border: "1px solid #1a1a1a", borderRadius: 8, padding: "10px 14px", color: "#ddd", fontSize: 13, outline: "none", fontFamily: "inherit" }}
            />
            <button onClick={() => sendSetupAnswer(input)} disabled={!input.trim() || sending}
              style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#FF3B30,#CC1A10)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: input.trim() ? 1 : .4 }}>
              {sending ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}

      {/* DNA OVERVIEW */}
      {dna?.setupComplete && activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Agent Identity Card */}
          <div style={{ background: `${rc}10`, border: `1px solid ${rc}25`, borderRadius: 14, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${rc}20`, border: `1px solid ${rc}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                {dna.agentRole === "CEO" ? "👑" : dna.agentRole === "CMO" ? "📢" : dna.agentRole === "CTO" ? "💻" : dna.agentRole === "CFO" ? "💰" : "🎯"}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{dna.agentName || "Vnus"}</div>
                <div style={{ fontSize: 11, color: rc }}>AI {dna.agentRole || "CEO"} of {dna.business?.name}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Business", value: dna.business?.name || "—" },
                { label: "Type", value: dna.business?.type || "—" },
                { label: "Product", value: dna.product?.name || "—" },
                { label: "Revenue", value: dna.metrics?.mrr || "—" },
                { label: "Focus", value: dna.currentFocus || "—" },
                { label: "Brand Voice", value: dna.marketing?.brandVoice || "—" },
              ].map(item => (
                <div key={item.label} style={{ background: "rgba(0,0,0,.3)", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 9, color: "#333", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#ccc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Competitors */}
          {dna.competitors && dna.competitors.length > 0 && (
            <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid #111", borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>Competitors Being Monitored</div>
              {dna.competitors.map(c => (
                <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #0d0d0d" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF3B30", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#bbb" }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: "#444" }}>Weakness: {c.weakness}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Goals */}
          {dna.metrics?.goals && dna.metrics.goals.length > 0 && (
            <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid #111", borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>Business Goals</div>
              {dna.metrics.goals.map((g: any, i: number) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,59,48,.1)", border: "1px solid rgba(255,59,48,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#FF3B30", flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 12, color: "#bbb", lineHeight: 1.5 }}>{g.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* Re-setup button */}
          <button onClick={startSetup}
            style={{ padding: "10px", borderRadius: 10, border: "1px solid #1a1a1a", background: "rgba(255,255,255,.03)", color: "#555", fontSize: 12, cursor: "pointer" }}>
            ↺ Update Business DNA
          </button>
        </div>
      )}

      {/* BRIEFING TAB */}
      {dna?.setupComplete && activeTab === "briefing" && (
        <div>
          {briefing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid #1a1a1a", borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
                  ☀️ {briefing.agentName}'s Daily Brief
                </div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 14 }}>
                  {new Date(briefing.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </div>
                <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7, marginBottom: 14 }}>
                  {briefing.greeting}
                </div>

                {/* Alerts */}
                {briefing.alerts?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>Alerts</div>
                    {briefing.alerts.map((a, i) => (
                      <div key={i} style={{ background: a.type === "warning" ? "rgba(251,191,36,.05)" : a.type === "opportunity" ? "rgba(74,222,128,.05)" : "rgba(96,165,250,.05)", border: `1px solid ${a.type === "warning" ? "rgba(251,191,36,.15)" : a.type === "opportunity" ? "rgba(74,222,128,.15)" : "rgba(96,165,250,.15)"}`, borderRadius: 8, padding: "10px 12px", marginBottom: 6 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: a.type === "warning" ? "#fbbf24" : a.type === "opportunity" ? "#4ade80" : "#60a5fa", marginBottom: 4 }}>{a.title}</div>
                        <div style={{ fontSize: 11, color: "#777", marginBottom: 4 }}>{a.description}</div>
                        <div style={{ fontSize: 11, color: "#555" }}>→ {a.action}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tasks */}
                {briefing.tasksForToday?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>Today's Priorities</div>
                    {briefing.tasksForToday.map((t, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #0d0d0d" }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: t.priority === "high" ? "rgba(255,59,48,.12)" : "rgba(255,255,255,.05)", border: `1px solid ${t.priority === "high" ? "rgba(255,59,48,.25)" : "#1a1a1a"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: t.priority === "high" ? "#FF3B30" : "#555", flexShrink: 0 }}>{i + 1}</div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#ccc" }}>{t.task}</div>
                          <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{t.reason}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Strategic Insight */}
                {briefing.strategicInsight && (
                  <div style={{ background: "rgba(255,59,48,.05)", border: "1px solid rgba(255,59,48,.12)", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#FF3B30", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".08em" }}>💡 Strategic Insight</div>
                    <div style={{ fontSize: 12, color: "#999", lineHeight: 1.6 }}>{briefing.strategicInsight}</div>
                  </div>
                )}

                {briefing.motivationalNote && (
                  <div style={{ fontSize: 12, color: "#555", fontStyle: "italic", textAlign: "center", paddingTop: 10 }}>
                    {briefing.motivationalNote} 👹
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>☀️</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#ddd", marginBottom: 8 }}>No briefing yet</div>
              <div style={{ fontSize: 12, color: "#444", marginBottom: 20 }}>
                Morning briefings are generated automatically at 9am.<br/>
                Or type "brief me on today" in the chat.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}