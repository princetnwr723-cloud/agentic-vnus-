"use client";
import { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import toast from "react-hot-toast";

interface Agent { id: string; name: string; emoji: string; role: string; }

const AGENT_LIST: Agent[] = [
  { id: "boss",       name: "Boss Agent",      emoji: "👑", role: "Coordinator" },
  { id: "researcher", name: "Research Agent",  emoji: "🔍", role: "Research" },
  { id: "writer",     name: "Content Writer",  emoji: "✍️", role: "Content" },
  { id: "developer",  name: "Developer Agent", emoji: "💻", role: "Code" },
  { id: "marketer",   name: "Marketing Agent", emoji: "📢", role: "Marketing" },
  { id: "analyst",    name: "Analytics Agent", emoji: "📊", role: "Data" },
  { id: "sales",      name: "Sales Agent",     emoji: "💰", role: "Sales" },
  { id: "editor",     name: "Editor Agent",    emoji: "✅", role: "Quality" },
];

export default function MarketplaceSection({ workspaceId }: { workspaceId: string }) {
  const { user } = useAuth();
  const [mode,        setMode]        = useState<"agent" | "team">("agent");
  const [selectedAgent, setSelectedAgent] = useState("researcher");
  const [teamName,    setTeamName]    = useState("");
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [visibility,  setVisibility]  = useState<"private" | "public">("private");
  const [exporting,   setExporting]   = useState(false);
  const [result,      setResult]      = useState<{success:boolean; message:string}|null>(null);

  useEffect(() => {
    if (!rtdb) return;
    const unsub = onValue(ref(rtdb, `workspaces/${workspaceId}/marketplaceResult`), snap => {
      const d = snap.val();
      if (d && d.timestamp > Date.now() - 20000) handleExportResult(d);
    });
    return () => unsub();
  }, [workspaceId]);

  const toggleMember = (id: string) => {
    setTeamMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : prev.length < 6 ? [...prev, id] : prev);
  };

  const handleExportResult = async (d: any) => {
    if (!d.success || !d.bundle) {
      setResult({ success: false, message: d.error || "Export failed" });
      setExporting(false);
      return;
    }
    // Bundle came back from the local agent — now save it to Firestore
    // so it can actually be browsed/installed by other users
    try {
      await addDoc(collection(db, "agent_bundles"), {
        ...d.bundle,
        authorId: user?.uid,
        author:   user?.displayName || user?.email?.split("@")[0] || "Anonymous",
        visibility,
        downloads: 0,
        rating: 0,
        createdAt: serverTimestamp(),
      });
      setResult({ success: true, message: `${visibility === "public" ? "Published to marketplace!" : "Saved privately."}` });
      toast.success(visibility === "public" ? "Shared to marketplace! 🎉" : "Saved privately!");
    } catch (err) {
      setResult({ success: false, message: "Bundle created but Firestore save failed — check permissions" });
    }
    setExporting(false);
  };

  const handleExport = async () => {
    if (!rtdb) return;
    if (mode === "team" && (!teamName.trim() || teamMembers.length < 2)) {
      toast.error("Name your team and pick at least 2 agents");
      return;
    }
    setExporting(true);
    setResult(null);

    await set(ref(rtdb, `workspaces/${workspaceId}/marketplaceAction`), {
      action: mode === "agent" ? "export_agent" : "export_team",
      agentId: mode === "agent" ? selectedAgent : undefined,
      teamName: mode === "team" ? teamName.trim() : undefined,
      memberAgentIds: mode === "team" ? teamMembers : undefined,
      sentAt: Date.now(),
    });

    setTimeout(() => setExporting(false), 20000); // safety timeout
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 3 }}>Share to Marketplace</h3>
        <p style={{ fontSize: 11, color: "#444" }}>
          Share one agent's prompt + training, or a full team, for others to install. Config only — no code runs on their machine.
        </p>
      </div>

      <div style={{ background: "rgba(96,165,250,.05)", border: "1px solid rgba(96,165,250,.15)", borderLeft: "3px solid #60a5fa", borderRadius: 9, padding: "10px 14px", fontSize: 11, color: "#80b0e0", lineHeight: 1.6 }}>
        <strong style={{ color: "#60a5fa" }}>Safe by design:</strong> shared bundles contain prompt text, training instructions, and which MCPs a role needs — never executable code. Nothing you install can read your files or make network calls on its own.
      </div>

      <div style={{ display: "flex", background: "rgba(255,255,255,.04)", borderRadius: 8, padding: 3, gap: 3 }}>
        {(["agent", "team"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "none", background: mode === m ? "#FF3B30" : "transparent", color: mode === m ? "#fff" : "#555", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            {m === "agent" ? "🤖 Single Agent" : "👥 Full Team"}
          </button>
        ))}
      </div>

      {mode === "agent" && (
        <div>
          <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>Which agent?</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {AGENT_LIST.map(a => (
              <button key={a.id} onClick={() => setSelectedAgent(a.id)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, border: `1px solid ${selectedAgent === a.id ? "rgba(255,59,48,.3)" : "#1a1a1a"}`, background: selectedAgent === a.id ? "rgba(255,59,48,.08)" : "rgba(255,255,255,.02)", cursor: "pointer", textAlign: "left" }}>
                <span>{a.emoji}</span>
                <span style={{ fontSize: 11, color: selectedAgent === a.id ? "#fff" : "#888", fontWeight: 600 }}>{a.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === "team" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>Team Name</label>
            <input value={teamName} onChange={e => setTeamName(e.target.value)}
              placeholder="e.g. Full Stack Marketing Squad"
              style={{ width: "100%", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 8, padding: "9px 12px", color: "#ddd", fontSize: 12, outline: "none" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>
              Pick 2-6 agents <span style={{ color: "#333" }}>({teamMembers.length} selected)</span>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {AGENT_LIST.filter(a => a.id !== "boss").map(a => (
                <button key={a.id} onClick={() => toggleMember(a.id)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, border: `1px solid ${teamMembers.includes(a.id) ? "rgba(255,59,48,.3)" : "#1a1a1a"}`, background: teamMembers.includes(a.id) ? "rgba(255,59,48,.08)" : "rgba(255,255,255,.02)", cursor: "pointer", textAlign: "left" }}>
                  <span>{a.emoji}</span>
                  <span style={{ fontSize: 11, color: teamMembers.includes(a.id) ? "#fff" : "#888", fontWeight: 600 }}>{a.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 10, color: "#333", lineHeight: 1.5 }}>
            👑 Boss Agent is always the head of an installed team — it's not selected here, it's assumed.
          </div>
        </div>
      )}

      <div>
        <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>Visibility</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button onClick={() => setVisibility("private")}
            style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${visibility === "private" ? "rgba(255,59,48,.3)" : "#1a1a1a"}`, background: visibility === "private" ? "rgba(255,59,48,.08)" : "rgba(255,255,255,.02)", color: visibility === "private" ? "#fff" : "#666", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            🔒 Private (just you)
          </button>
          <button onClick={() => setVisibility("public")}
            style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${visibility === "public" ? "rgba(74,222,128,.3)" : "#1a1a1a"}`, background: visibility === "public" ? "rgba(74,222,128,.08)" : "rgba(255,255,255,.02)", color: visibility === "public" ? "#4ade80" : "#666", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            🌍 Public (marketplace)
          </button>
        </div>
      </div>

      {result && (
        <div style={{ padding: "10px 14px", borderRadius: 9, fontSize: 12, background: result.success ? "rgba(74,222,128,.07)" : "rgba(255,59,48,.07)", border: `1px solid ${result.success ? "rgba(74,222,128,.2)" : "rgba(255,59,48,.2)"}`, color: result.success ? "#4ade80" : "#FF3B30" }}>
          {result.message}
        </div>
      )}

      <button onClick={handleExport} disabled={exporting}
        style={{ padding: "11px 0", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#FF3B30,#CC1A10)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: exporting ? .6 : 1 }}>
        {exporting ? "Exporting..." : `Share ${mode === "agent" ? "Agent" : "Team"}`}
      </button>

      <a href="/dashboard/agents-hub" style={{ fontSize: 11, color: "#FF3B30", textAlign: "center", textDecoration: "none" }}>
        Browse the Agent & Team Hub →
      </a>
    </div>
  );
}