"use client";
import { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { rtdb } from "@/lib/firebase";

interface AutoTask {
  id: string;
  label: string;
  status: "running" | "paused" | "waiting_approval" | "completed" | "failed";
  currentStep: number;
  totalSteps: number | null;
  pauseReason: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Macro {
  name: string;
  steps: number;
  runCount: number;
  lastRun: string | null;
  createdAt: string;
}

const STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
  running:          { color: "#4ade80", bg: "rgba(74,222,128,.08)",  label: "Running" },
  paused:           { color: "#fbbf24", bg: "rgba(251,191,36,.08)",  label: "Paused" },
  waiting_approval: { color: "#FF3B30", bg: "rgba(255,59,48,.08)",   label: "Needs Approval" },
  completed:        { color: "#60a5fa", bg: "rgba(96,165,250,.08)",  label: "Completed" },
  failed:           { color: "#ef4444", bg: "rgba(239,68,68,.08)",   label: "Failed" },
};

export default function AutomationSection({ workspaceId }: { workspaceId: string }) {
  const [tasks,  setTasks]  = useState<AutoTask[]>([]);
  const [macros, setMacros] = useState<Macro[]>([]);
  const [tab,    setTab]    = useState<"tasks" | "macros">("tasks");

  useEffect(() => {
    if (!rtdb) return;
    const u1 = onValue(ref(rtdb, `workspaces/${workspaceId}/automationTasks`), snap => {
      const d = snap.val(); setTasks(d ? (Array.isArray(d) ? d : Object.values(d)) : []);
    });
    const u2 = onValue(ref(rtdb, `workspaces/${workspaceId}/automationMacros`), snap => {
      const d = snap.val(); setMacros(d ? (Array.isArray(d) ? d : Object.values(d)) : []);
    });
    return () => { u1(); u2(); };
  }, [workspaceId]);

  const sendAction = async (action: string, extra: Record<string, any> = {}) => {
    if (!rtdb) return;
    await set(ref(rtdb, `workspaces/${workspaceId}/automationAction`), {
      action, sentAt: Date.now(), ...extra,
    });
  };

  const pendingCount = tasks.filter(t => t.status === "waiting_approval").length;
  const activeCount  = tasks.filter(t => ["running", "paused", "waiting_approval"].includes(t.status)).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 3 }}>Automation</h3>
          <p style={{ fontSize: 11, color: "#444" }}>
            Reliable multi-step tasks · learn-by-demonstration for tools without an API
          </p>
        </div>
        {pendingCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: "rgba(255,59,48,.08)", border: "1px solid rgba(255,59,48,.2)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF3B30", animation: "pulse 1.2s infinite" }} />
            <span style={{ fontSize: 11, color: "#FF3B30", fontWeight: 700 }}>{pendingCount} need approval</span>
          </div>
        )}
      </div>

      <div style={{ background: "rgba(96,165,250,.05)", border: "1px solid rgba(96,165,250,.15)", borderLeft: "3px solid #60a5fa", borderRadius: 9, padding: "10px 14px", fontSize: 11, color: "#80b0e0", lineHeight: 1.6 }}>
        <strong style={{ color: "#60a5fa" }}>How it works:</strong> Long tasks pause here when they hit an approval step, a CAPTCHA, or an unexpected screen — resume with one tap and the agent continues from that exact step. Record a workflow once for tools with no API, then replay it with new data any time.
      </div>

      <div style={{ display: "flex", background: "rgba(255,255,255,.04)", borderRadius: 8, padding: 3, gap: 3 }}>
        {(["tasks", "macros"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "none", background: tab === t ? "#FF3B30" : "transparent", color: tab === t ? "#fff" : "#555", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            {t === "tasks" ? `⏸ Tasks (${activeCount})` : `▶ Recorded Macros (${macros.length})`}
          </button>
        ))}
      </div>

      {tab === "tasks" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {tasks.length === 0 && (
            <div style={{ textAlign: "center", padding: 24, color: "#333", fontSize: 12 }}>
              No automation tasks yet. Long browser tasks will appear here.
            </div>
          )}
          {tasks.map(task => {
            const meta = STATUS_META[task.status] || STATUS_META.running;
            return (
              <div key={task.id} style={{ padding: "12px 14px", borderRadius: 10, border: `1px solid ${meta.color}25`, background: meta.bg }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#ddd" }}>{task.label}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: `${meta.color}18`, color: meta.color }}>{meta.label}</span>
                </div>
                {task.totalSteps && (
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ width: "100%", height: 4, borderRadius: 3, background: "rgba(255,255,255,.06)", overflow: "hidden" }}>
                      <div style={{ width: `${(task.currentStep / task.totalSteps) * 100}%`, height: "100%", background: meta.color, borderRadius: 3, transition: "width .3s" }} />
                    </div>
                    <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>Step {task.currentStep} of {task.totalSteps}</div>
                  </div>
                )}
                {task.pauseReason && (
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 8, lineHeight: 1.5 }}>
                    {task.status === "waiting_approval" ? "Waiting: " : "Stuck: "}{task.pauseReason}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6 }}>
                  {["paused", "waiting_approval"].includes(task.status) && (
                    <button onClick={() => sendAction("resume_task", { taskId: task.id })}
                      style={{ flex: 1, padding: "6px 0", borderRadius: 7, border: "none", background: "linear-gradient(135deg,#FF3B30,#CC1A10)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                      Approve & Resume
                    </button>
                  )}
                  {["completed", "failed"].includes(task.status) && (
                    <button onClick={() => sendAction("delete_task", { taskId: task.id })}
                      style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid #1a1a1a", background: "rgba(255,255,255,.03)", color: "#555", fontSize: 11, cursor: "pointer" }}>
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "macros" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {macros.length === 0 && (
            <div style={{ textAlign: "center", padding: 24 }}>
              <div style={{ fontSize: 12, color: "#444", marginBottom: 6 }}>No recorded workflows yet</div>
              <div style={{ fontSize: 11, color: "#333", lineHeight: 1.6 }}>
                Tell the agent to "record this" before doing a task manually in a tool with no API — it'll learn the steps and replay them with new data next time.
              </div>
            </div>
          )}
          {macros.map(m => (
            <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, border: "1px solid #111", background: "rgba(255,255,255,.02)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#ccc", marginBottom: 2 }}>{m.name}</div>
                <div style={{ fontSize: 10, color: "#444" }}>{m.steps} steps · run {m.runCount}× {m.lastRun ? `· last: ${new Date(m.lastRun).toLocaleDateString()}` : ""}</div>
              </div>
              <button onClick={() => sendAction("delete_macro", { macroName: m.name })}
                style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(255,59,48,.2)", background: "rgba(255,59,48,.07)", color: "#FF3B30", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}