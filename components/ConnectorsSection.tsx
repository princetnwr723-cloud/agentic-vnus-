"use client";
import { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { rtdb } from "@/lib/firebase";

interface ConnectorDef {
  name:        string;
  icon:        string;
  description: string;
  keyHint:     string;
  defaultModel:string;
  models:      string[];
  bestFor:     string[];
}

interface ConnectorStatus {
  provider:   string;
  enabled:    boolean;
  model:      string;
  savedAt:    string;
  maskedKey:  string;
}

const CONNECTOR_DEFS: Record<string, ConnectorDef> = {
  openrouter: { name:"OpenRouter",    icon:"🔀", description:"100+ models — Claude, GPT-4o, Gemini, Llama in one key", keyHint:"sk-or-v1-...",      defaultModel:"anthropic/claude-sonnet-4-5",             models:["anthropic/claude-sonnet-4-5","openai/gpt-4o","google/gemini-pro-1.5","deepseek/deepseek-r1","meta-llama/llama-3.3-70b-instruct"], bestFor:["coding","content","strategy","general"] },
  anthropic:  { name:"Anthropic",     icon:"🤖", description:"Claude Sonnet — best reasoning and coding",             keyHint:"sk-ant-api03-...", defaultModel:"claude-sonnet-4-5",                        models:["claude-opus-4-5","claude-sonnet-4-5","claude-haiku-4-5-20251001"],                                                             bestFor:["coding","reasoning","content"] },
  openai:     { name:"OpenAI",        icon:"⚡", description:"GPT-4o, o1, o3 — most capable models",                 keyHint:"sk-proj-...",      defaultModel:"gpt-4o",                                    models:["gpt-4o","gpt-4o-mini","o1-mini","o3-mini"],                                                                                    bestFor:["coding","general","reasoning"] },
  gemini:     { name:"Google Gemini", icon:"💎", description:"Gemini 2.0 Flash — fast, free tier, 2M context",       keyHint:"AIzaSy...",        defaultModel:"gemini-2.0-flash",                          models:["gemini-2.0-flash","gemini-1.5-pro","gemini-1.5-flash"],                                                                        bestFor:["general","content","multimodal"] },
  groq:       { name:"Groq",          icon:"🚀", description:"Ultra-fast inference — Llama, Mixtral — free tier",    keyHint:"gsk_...",          defaultModel:"llama-3.3-70b-versatile",                   models:["llama-3.3-70b-versatile","mixtral-8x7b-32768","llama-3.1-8b-instant"],                                                        bestFor:["fast","general"] },
  mistral:    { name:"Mistral AI",    icon:"🌊", description:"Mistral Large — European privacy, strong reasoning",   keyHint:"your-api-key",    defaultModel:"mistral-large-latest",                      models:["mistral-large-latest","codestral-latest","mistral-medium-latest"],                                                             bestFor:["coding","general"] },
  together:   { name:"Together AI",  icon:"🤝", description:"Open source models — cheap, fast, Llama hosted",       keyHint:"your-api-key",    defaultModel:"meta-llama/Llama-3.3-70B-Instruct-Turbo",   models:["meta-llama/Llama-3.3-70B-Instruct-Turbo","Qwen/Qwen2.5-72B-Instruct-Turbo"],                                                 bestFor:["general","cheap"] },
  deepseek:   { name:"DeepSeek",      icon:"🔬", description:"DeepSeek R1 — world-class reasoning, very cheap",     keyHint:"sk-...",           defaultModel:"deepseek-reasoner",                          models:["deepseek-reasoner","deepseek-chat"],                                                                                           bestFor:["reasoning","coding","cheap"] },
  perplexity: { name:"Perplexity",    icon:"🔍", description:"Web search + AI — real-time information access",      keyHint:"pplx-...",         defaultModel:"sonar-pro",                                  models:["sonar-pro","sonar","sonar-reasoning"],                                                                                         bestFor:["research","web-search"] },
  cohere:     { name:"Cohere",        icon:"🎯", description:"Command R+ — excellent for RAG and enterprise",       keyHint:"your-api-key",    defaultModel:"command-r-plus",                             models:["command-r-plus","command-r","command-light"],                                                                                  bestFor:["rag","enterprise"] },
};

const ROUTING_INFO = [
  { task:"Coding",    providers:["anthropic","openrouter","openai","deepseek"] },
  { task:"Reasoning", providers:["anthropic","deepseek","openrouter"] },
  { task:"Content",   providers:["anthropic","openrouter","gemini"] },
  { task:"Research",  providers:["perplexity","gemini","openrouter"] },
  { task:"Fast",      providers:["groq","gemini","openai"] },
];

export default function ConnectorsSection({ workspaceId }: { workspaceId: string }) {
  const [connectors,   setConnectors]   = useState<Record<string, ConnectorStatus>>({});
  const [selected,     setSelected]     = useState<string | null>(null);
  const [apiKey,       setApiKey]       = useState("");
  const [selModel,     setSelModel]     = useState("");
  const [testing,      setTesting]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [testResult,   setTestResult]   = useState<{success:boolean;message:string} | null>(null);
  const [removing,     setRemoving]     = useState<string | null>(null);
  const [showRouting,  setShowRouting]  = useState(false);

  // Load connector status from RTDB (agent syncs it)
  useEffect(() => {
    if (!rtdb) return;
    const unsub = onValue(ref(rtdb, `workspaces/${workspaceId}/connectors`), snap => {
      const d = snap.val();
      if (d) setConnectors(d);
    });
    return () => unsub();
  }, [workspaceId]);

  const openConnector = (provider: string) => {
    setSelected(provider);
    setApiKey("");
    setSelModel(connectors[provider]?.model || CONNECTOR_DEFS[provider]?.defaultModel || "");
    setTestResult(null);
  };

  const testKey = async () => {
    if (!apiKey.trim() || !selected) return;
    setTesting(true);
    setTestResult(null);
    try {
      // Send test command to agent via RTDB
      await set(ref(rtdb, `workspaces/${workspaceId}/connectorAction`), {
        action:   "test",
        provider: selected,
        apiKey:   apiKey.trim(),
        sentAt:   Date.now(),
      });
      // Wait for result
      let waited = 0;
      const check = setInterval(() => {
        waited += 500;
        if (waited > 15000) {
          clearInterval(check);
          setTestResult({ success: false, message: "Timeout — agent did not respond. Make sure agent is online." });
          setTesting(false);
        }
      }, 500);
      const unsub = onValue(ref(rtdb, `workspaces/${workspaceId}/connectorTestResult`), snap => {
        const d = snap.val();
        if (d?.provider === selected && d?.testedAt > Date.now() - 20000) {
          clearInterval(check);
          unsub();
          setTestResult({ success: d.success, message: d.success ? `✅ Connected — ${d.model || selected} ready` : `❌ Failed: ${d.error}` });
          setTesting(false);
        }
      });
    } catch (err: any) {
      setTestResult({ success: false, message: `Error: ${err.message}` });
      setTesting(false);
    }
  };

  const saveKey = async () => {
    if (!apiKey.trim() || !selected || !testResult?.success) return;
    setSaving(true);
    try {
      await set(ref(rtdb, `workspaces/${workspaceId}/connectorAction`), {
        action:   "save",
        provider: selected,
        apiKey:   apiKey.trim(),
        model:    selModel || CONNECTOR_DEFS[selected]?.defaultModel,
        sentAt:   Date.now(),
      });
      setTimeout(() => {
        setSaving(false);
        setSelected(null);
        setApiKey("");
        setTestResult(null);
      }, 1500);
    } catch (err) {
      setSaving(false);
    }
  };

  const removeKey = async (provider: string) => {
    if (!window.confirm(`Remove ${CONNECTOR_DEFS[provider]?.name} connector?`)) return;
    setRemoving(provider);
    await set(ref(rtdb, `workspaces/${workspaceId}/connectorAction`), {
      action: "remove", provider, sentAt: Date.now(),
    });
    setTimeout(() => setRemoving(null), 1500);
  };

  const connectedCount = Object.keys(connectors).filter(k => connectors[k]?.enabled).length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h3 style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:3 }}>API Connectors</h3>
          <p style={{ fontSize:11, color:"#444" }}>
            {connectedCount > 0
              ? `${connectedCount} connected — agent uses best API for complex tasks`
              : "Connect API keys — agent uses them for complex tasks automatically"}
          </p>
        </div>
        <button onClick={() => setShowRouting(!showRouting)}
          style={{ fontSize:10, color:"#555", background:"rgba(255,255,255,.04)", border:"1px solid #1a1a1a", borderRadius:7, padding:"4px 10px", cursor:"pointer" }}>
          {showRouting ? "Hide" : "View"} routing
        </button>
      </div>

      {/* How it works */}
      <div style={{ background:"rgba(255,59,48,.04)", border:"1px solid rgba(255,59,48,.12)", borderRadius:10, padding:12, fontSize:11, color:"#777", lineHeight:1.6 }}>
        <strong style={{ color:"#FF3B30" }}>How it works:</strong> Simple tasks (files, browser, apps) always use your local AI — free and private. Complex tasks (marketing campaigns, advanced code, research) automatically route to the best connected API. <strong style={{ color:"#ccc" }}>Your keys are encrypted on your PC — never sent to any server.</strong>
      </div>

      {/* Smart Routing Info */}
      {showRouting && (
        <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid #1a1a1a", borderRadius:10, padding:14 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:".1em", marginBottom:10 }}>Smart Routing Priority</div>
          {ROUTING_INFO.map(r => (
            <div key={r.task} style={{ display:"flex", alignItems:"center", gap:10, padding:"5px 0", borderBottom:"1px solid #0d0d0d" }}>
              <div style={{ fontSize:11, color:"#666", width:70 }}>{r.task}</div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {r.providers.map((p, i) => (
                  <span key={p} style={{ fontSize:10, padding:"1px 7px", borderRadius:10, background: connectors[p]?.enabled ? "rgba(74,222,128,.1)" : "rgba(255,255,255,.04)", color: connectors[p]?.enabled ? "#4ade80" : "#333", border: `1px solid ${connectors[p]?.enabled ? "rgba(74,222,128,.2)" : "#1a1a1a"}` }}>
                    {i+1}. {CONNECTOR_DEFS[p]?.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connector Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {Object.entries(CONNECTOR_DEFS).map(([provider, def]) => {
          const status    = connectors[provider];
          const connected = status?.enabled;
          return (
            <div key={provider}
              style={{ background: connected ? "rgba(74,222,128,.04)" : "rgba(255,255,255,.02)", border:`1px solid ${connected ? "rgba(74,222,128,.2)" : "#1a1a1a"}`, borderRadius:10, padding:12, transition:"all .2s", position:"relative" }}>

              {/* Connected badge */}
              {connected && (
                <div style={{ position:"absolute", top:8, right:8, fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:10, background:"rgba(74,222,128,.1)", color:"#4ade80", border:"1px solid rgba(74,222,128,.2)" }}>
                  CONNECTED
                </div>
              )}

              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ fontSize:20 }}>{def.icon}</span>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#ccc" }}>{def.name}</div>
                  {connected && (
                    <div style={{ fontSize:10, color:"#4ade80", marginTop:1 }}>
                      {status.maskedKey} · {status.model?.split("/").pop()?.slice(0,20)}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ fontSize:11, color:"#444", lineHeight:1.5, marginBottom:10 }}>{def.description}</div>

              <div style={{ display:"flex", gap:5 }}>
                {def.bestFor.slice(0,3).map(t => (
                  <span key={t} style={{ fontSize:9, padding:"1px 6px", borderRadius:8, background:"rgba(255,59,48,.08)", color:"#FF3B30", border:"1px solid rgba(255,59,48,.15)" }}>{t}</span>
                ))}
              </div>

              <div style={{ display:"flex", gap:6, marginTop:10 }}>
                <button onClick={() => openConnector(provider)}
                  style={{ flex:1, padding:"6px 0", borderRadius:7, border:"none", background: connected ? "rgba(255,255,255,.06)" : "linear-gradient(135deg,#FF3B30,#CC1A10)", color: connected ? "#888" : "#fff", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                  {connected ? "Update Key" : "Connect"}
                </button>
                {connected && (
                  <button onClick={() => removeKey(provider)} disabled={removing === provider}
                    style={{ padding:"6px 10px", borderRadius:7, border:"1px solid rgba(255,59,48,.2)", background:"rgba(255,59,48,.06)", color:"#FF3B30", fontSize:11, cursor:"pointer" }}>
                    {removing === provider ? "..." : "Remove"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect Modal */}
      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.85)", backdropFilter:"blur(8px)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={e => { if (e.target === e.currentTarget) { setSelected(null); setTestResult(null); } }}>
          <div style={{ width:"100%", maxWidth:440, background:"#0a0a0a", border:"1px solid rgba(255,59,48,.2)", borderRadius:16, overflow:"hidden" }}>
            <div style={{ height:2, background:"linear-gradient(90deg,transparent,#FF3B30,transparent)" }} />
            <div style={{ padding:24 }}>

              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                <span style={{ fontSize:28 }}>{CONNECTOR_DEFS[selected]?.icon}</span>
                <div>
                  <div style={{ fontSize:15, fontWeight:800, color:"#fff" }}>Connect {CONNECTOR_DEFS[selected]?.name}</div>
                  <div style={{ fontSize:11, color:"#444", marginTop:2 }}>{CONNECTOR_DEFS[selected]?.description}</div>
                </div>
                <button onClick={() => { setSelected(null); setTestResult(null); }}
                  style={{ marginLeft:"auto", background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:18, lineHeight:1 }}>×</button>
              </div>

              {/* API Key input */}
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:11, color:"#555", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:".08em", fontWeight:700 }}>API Key</label>
                <input value={apiKey} onChange={e => { setApiKey(e.target.value); setTestResult(null); }}
                  placeholder={CONNECTOR_DEFS[selected]?.keyHint}
                  type="password"
                  style={{ width:"100%", background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:8, padding:"10px 14px", color:"#ddd", fontSize:13, outline:"none", fontFamily:"monospace" }}
                />
                <div style={{ fontSize:10, color:"#333", marginTop:4 }}>🔒 Encrypted on your PC — never sent to any server</div>
              </div>

              {/* Model selector */}
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, color:"#555", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:".08em", fontWeight:700 }}>Model</label>
                <select value={selModel} onChange={e => setSelModel(e.target.value)}
                  style={{ width:"100%", background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:8, padding:"9px 12px", color:"#ddd", fontSize:13, outline:"none", cursor:"pointer" }}>
                  {CONNECTOR_DEFS[selected]?.models.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Test result */}
              {testResult && (
                <div style={{ padding:"9px 12px", borderRadius:8, marginBottom:12, fontSize:12, background: testResult.success ? "rgba(74,222,128,.07)" : "rgba(255,59,48,.07)", border:`1px solid ${testResult.success ? "rgba(74,222,128,.2)" : "rgba(255,59,48,.2)"}`, color: testResult.success ? "#4ade80" : "#FF3B30" }}>
                  {testResult.message}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={testKey} disabled={!apiKey.trim() || testing}
                  style={{ flex:1, padding:"10px 0", borderRadius:9, border:"1px solid rgba(255,59,48,.25)", background:"rgba(255,59,48,.08)", color:"#FF3B30", fontSize:13, fontWeight:700, cursor:"pointer", opacity: !apiKey.trim() || testing ? .5 : 1 }}>
                  {testing ? "Testing..." : "Test Connection"}
                </button>
                <button onClick={saveKey} disabled={!testResult?.success || saving}
                  style={{ flex:1, padding:"10px 0", borderRadius:9, border:"none", background: testResult?.success ? "linear-gradient(135deg,#FF3B30,#CC1A10)" : "rgba(255,255,255,.05)", color: testResult?.success ? "#fff" : "#444", fontSize:13, fontWeight:700, cursor:"pointer", opacity: !testResult?.success || saving ? .6 : 1 }}>
                  {saving ? "Saving..." : "Save Key"}
                </button>
              </div>

              <div style={{ textAlign:"center", marginTop:12, fontSize:11, color:"#333" }}>
                Get API key from {CONNECTOR_DEFS[selected]?.name}'s website · Free tiers available
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}