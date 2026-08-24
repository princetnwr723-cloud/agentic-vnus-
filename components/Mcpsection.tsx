"use client";
import { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { rtdb } from "@/lib/firebase";

interface MCPServer {
  id:          string;
  name:        string;
  icon:        string;
  description: string;
  installed?:  boolean;
  running?:    boolean;
  toolCount?:  number;
  official?:   boolean;
  category?:   string;
  envRequired?: string[];
}

const CATEGORIES: Record<string, string> = {
  system:        "💻 System",
  search:        "🔍 Search",
  dev:           "🛠️ Dev Tools",
  google:        "🔵 Google",
  communication: "💬 Communication",
  database:      "🗄️ Database",
  browser:       "🌐 Browser",
  memory:        "🧠 Memory",
  custom:        "⚡ Custom",
};

export default function MCPSection({ workspaceId }: { workspaceId: string }) {
  const [status,     setStatus]     = useState<{ builtin: MCPServer[]; custom: MCPServer[]; totalRunning: number } | null>(null);
  const [showAdd,    setShowAdd]    = useState(false);
  const [addType,    setAddType]    = useState<"npm"|"github"|"local"|"http">("npm");
  const [addSource,  setAddSource]  = useState("");
  const [addName,    setAddName]    = useState("");
  const [addId,      setAddId]      = useState("");
  const [addEnv,     setAddEnv]     = useState("");
  const [adding,     setAdding]     = useState(false);
  const [addResult,  setAddResult]  = useState<{success:boolean;message:string}|null>(null);
  const [activeTab,  setActiveTab]  = useState<"builtin"|"custom">("builtin");

  useEffect(() => {
    if (!rtdb) return;
    const unsub = onValue(ref(rtdb, `workspaces/${workspaceId}/mcpStatus`), snap => {
      const d = snap.val();
      if (d) setStatus(d);
    });
    return () => unsub();
  }, [workspaceId]);

  const toggleServer = async (server: MCPServer, install: boolean) => {
    if (!rtdb) return;
    await set(ref(rtdb, `workspaces/${workspaceId}/mcpAction`), {
      action:   install ? "install" : "remove",
      serverId: server.id,
      server,
      sentAt:   Date.now(),
    });
  };

  const addCustomServer = async () => {
    if (!addSource.trim() || !addName.trim()) return;
    setAdding(true);
    setAddResult(null);

    // Parse env vars
    const envObj: Record<string, string> = {};
    if (addEnv.trim()) {
      addEnv.split("\n").forEach(line => {
        const [k, ...v] = line.split("=");
        if (k && v.length) envObj[k.trim()] = v.join("=").trim();
      });
    }

    await set(ref(rtdb, `workspaces/${workspaceId}/mcpAction`), {
      action: "add_custom",
      config: {
        id:     addId || addName.toLowerCase().replace(/\s+/g, "-"),
        name:   addName,
        icon:   "⚡",
        source: addSource,
        type:   addType,
        env:    envObj,
        description: `Custom MCP: ${addName}`,
      },
      sentAt: Date.now(),
    });

    // Listen for result
    const unsub = onValue(ref(rtdb, `workspaces/${workspaceId}/mcpActionResult`), snap => {
      const d = snap.val();
      if (d && d.timestamp > Date.now() - 10000) {
        setAddResult({ success: d.success, message: d.message });
        setAdding(false);
        if (d.success) {
          setShowAdd(false);
          setAddSource("");
          setAddName("");
          setAddId("");
          setAddEnv("");
        }
        unsub();
      }
    });

    setTimeout(() => { setAdding(false); }, 30000);
  };

  const grouped = status?.builtin?.reduce((acc: Record<string, MCPServer[]>, s) => {
    const cat = s.category || "custom";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {}) || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 3 }}>MCP Servers</h3>
          <p style={{ fontSize: 11, color: "#444" }}>
            {status?.totalRunning || 0} running · Connect any tool to supercharge your agent
          </p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,59,48,.25)", background: "rgba(255,59,48,.08)", color: "#FF3B30", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
          + Add Custom
        </button>
      </div>

      {/* Info callout */}
      <div style={{ background: "rgba(96,165,250,.05)", border: "1px solid rgba(96,165,250,.15)", borderLeft: "3px solid #60a5fa", borderRadius: 9, padding: "10px 14px", fontSize: 11, color: "#80b0e0", lineHeight: 1.6 }}>
        <strong style={{ color: "#60a5fa" }}>How it works:</strong> Enable any MCP server → agent automatically gets access to its tools. Add any custom MCP from npm, GitHub, or local path.
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "rgba(255,255,255,.04)", borderRadius: 8, padding: 3, gap: 3 }}>
        {(["builtin", "custom"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "none", background: activeTab === tab ? "#FF3B30" : "transparent", color: activeTab === tab ? "#fff" : "#555", fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "capitalize" }}>
            {tab === "builtin" ? "🔌 Official MCPs" : "⚡ Custom MCPs"}
          </button>
        ))}
      </div>

      {/* Built-in MCPs */}
      {activeTab === "builtin" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Object.entries(grouped).map(([cat, servers]) => (
            <div key={cat}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#333", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>
                {CATEGORIES[cat] || cat}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {servers.map(server => (
                  <div key={server.id} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                    borderRadius: 10, border: `1px solid ${server.running ? "rgba(74,222,128,.2)" : "#111"}`,
                    background: server.running ? "rgba(74,222,128,.04)" : "rgba(255,255,255,.02)",
                    transition: "all .2s",
                  }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{server.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#ccc" }}>{server.name}</span>
                        {server.official && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 8, background: "rgba(96,165,250,.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,.2)" }}>Official</span>}
                        {server.running && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 8, background: "rgba(74,222,128,.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,.2)" }}>● {server.toolCount} tools</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "#444", lineHeight: 1.4 }}>{server.description}</div>
                      {server.envRequired && !server.running && (
                        <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>
                          Requires: {server.envRequired.join(", ")}
                        </div>
                      )}
                    </div>
                    <button onClick={() => toggleServer(server, !server.installed)}
                      style={{
                        padding: "6px 14px", borderRadius: 8, border: "none", flexShrink: 0,
                        background: server.running ? "rgba(255,59,48,.08)" : "linear-gradient(135deg,#FF3B30,#CC1A10)",
                        color: server.running ? "#FF3B30" : "#fff",
                        fontSize: 11, fontWeight: 700, cursor: "pointer",
                        border: server.running ? "1px solid rgba(255,59,48,.2)" : "none",
                      }}>
                      {server.running ? "Disable" : "Enable"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {!status?.builtin?.length && (
            <div style={{ textAlign: "center", padding: 30, color: "#333", fontSize: 12 }}>
              Loading MCP servers... Make sure agent is online.
            </div>
          )}
        </div>
      )}

      {/* Custom MCPs */}
      {activeTab === "custom" && (
        <div>
          {!status?.custom?.length ? (
            <div style={{ textAlign: "center", padding: 30 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>⚡</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ddd", marginBottom: 6 }}>No custom MCPs yet</div>
              <div style={{ fontSize: 12, color: "#444", marginBottom: 16 }}>
                Add any MCP server from npm, GitHub, or local path
              </div>
              <button onClick={() => setShowAdd(true)}
                style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#FF3B30,#CC1A10)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                Add Custom MCP
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {status?.custom?.map(server => (
                <div key={server.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                  borderRadius: 10, border: `1px solid ${server.running ? "rgba(74,222,128,.2)" : "#111"}`,
                  background: server.running ? "rgba(74,222,128,.04)" : "rgba(255,255,255,.02)",
                }}>
                  <span style={{ fontSize: 20 }}>{server.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#ccc", marginBottom: 2 }}>{server.name}</div>
                    <div style={{ fontSize: 11, color: "#444" }}>{server.description}</div>
                    {server.running && <div style={{ fontSize: 10, color: "#4ade80", marginTop: 2 }}>● Running · {server.toolCount} tools available</div>}
                  </div>
                  <button onClick={() => toggleServer(server, false)}
                    style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(255,59,48,.2)", background: "rgba(255,59,48,.07)", color: "#FF3B30", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Custom Modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", backdropFilter: "blur(8px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div style={{ width: "100%", maxWidth: 460, background: "#0a0a0a", border: "1px solid rgba(255,59,48,.2)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#FF3B30,transparent)" }} />
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Add Custom MCP Server</div>
                <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18 }}>×</button>
              </div>

              {/* Type selector */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700 }}>Source Type</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {([
                    { id: "npm",    icon: "📦", label: "NPM Package" },
                    { id: "github", icon: "🐙", label: "GitHub Repo" },
                    { id: "local",  icon: "📁", label: "Local Path" },
                    { id: "http",   icon: "🌐", label: "HTTP API" },
                  ] as const).map(t => (
                    <button key={t.id} onClick={() => setAddType(t.id)}
                      style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${addType === t.id ? "rgba(255,59,48,.3)" : "#1a1a1a"}`, background: addType === t.id ? "rgba(255,59,48,.08)" : "rgba(255,255,255,.02)", color: addType === t.id ? "#FF3B30" : "#666", fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source input */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700 }}>
                  {addType === "npm" ? "Package Name" : addType === "github" ? "GitHub URL (user/repo)" : addType === "local" ? "File Path" : "HTTP Endpoint"}
                </label>
                <input value={addSource} onChange={e => setAddSource(e.target.value)}
                  placeholder={addType === "npm" ? "@modelcontextprotocol/server-brave-search" : addType === "github" ? "username/mcp-server-repo" : addType === "local" ? "C:/path/to/server.js" : "https://my-mcp.com/api"}
                  style={{ width: "100%", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 8, padding: "9px 12px", color: "#ddd", fontSize: 12, outline: "none", fontFamily: "monospace" }}
                />
              </div>

              {/* Display name */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700 }}>Display Name</label>
                <input value={addName} onChange={e => setAddName(e.target.value)}
                  placeholder="e.g. Notion, Figma, My Custom Tool"
                  style={{ width: "100%", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 8, padding: "9px 12px", color: "#ddd", fontSize: 12, outline: "none", fontFamily: "inherit" }}
                />
              </div>

              {/* Env vars */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700 }}>
                  Environment Variables <span style={{ color: "#333", textTransform: "none" }}>(optional)</span>
                </label>
                <textarea value={addEnv} onChange={e => setAddEnv(e.target.value)}
                  placeholder={"API_KEY=your-key-here\nANOTHER_VAR=value"}
                  rows={3}
                  style={{ width: "100%", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 8, padding: "9px 12px", color: "#ddd", fontSize: 11, outline: "none", fontFamily: "monospace", resize: "none" }}
                />
              </div>

              {/* Result */}
              {addResult && (
                <div style={{ padding: "9px 12px", borderRadius: 8, marginBottom: 12, fontSize: 12, background: addResult.success ? "rgba(74,222,128,.07)" : "rgba(255,59,48,.07)", border: `1px solid ${addResult.success ? "rgba(74,222,128,.2)" : "rgba(255,59,48,.2)"}`, color: addResult.success ? "#4ade80" : "#FF3B30" }}>
                  {addResult.message}
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowAdd(false)}
                  style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "1px solid #1a1a1a", background: "rgba(255,255,255,.03)", color: "#555", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={addCustomServer} disabled={!addSource.trim() || !addName.trim() || adding}
                  style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#FF3B30,#CC1A10)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: (!addSource.trim() || !addName.trim() || adding) ? .5 : 1 }}>
                  {adding ? "Installing..." : "Add MCP Server"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}