"use client";
import { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { rtdb } from "@/lib/firebase";

export default function TelegramSection({ workspaceId }: { workspaceId: string }) {
  const [token,     setToken]     = useState("");
  const [status,    setStatus]    = useState<{enabled:boolean;savedAt?:number}|null>(null);
  const [testing,   setTesting]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [testResult,setTestResult]= useState<{success:boolean;botName?:string;error?:string}|null>(null);
  const [activity,  setActivity]  = useState<{lastMessage:string;lastResponse:string;timestamp:number}|null>(null);

  useEffect(() => {
    if (!rtdb) return;
    const u1 = onValue(ref(rtdb, `workspaces/${workspaceId}/telegramStatus`), snap => {
      const d = snap.val(); if (d) setStatus(d);
    });
    const u2 = onValue(ref(rtdb, `workspaces/${workspaceId}/telegramActivity`), snap => {
      const d = snap.val(); if (d) setActivity(d);
    });
    const u3 = onValue(ref(rtdb, `workspaces/${workspaceId}/telegramTestResult`), snap => {
      const d = snap.val();
      if (d && d.timestamp > Date.now() - 15000) {
        setTestResult(d); setTesting(false);
      }
    });
    return () => { u1(); u2(); u3(); };
  }, [workspaceId]);

  const testToken = async () => {
    if (!token.trim() || !rtdb) return;
    setTesting(true); setTestResult(null);
    await set(ref(rtdb, `workspaces/${workspaceId}/telegramConfig`), {
      action: "test", token: token.trim(), sentAt: Date.now(),
    });
    setTimeout(() => setTesting(false), 15000);
  };

  const saveToken = async () => {
    if (!token.trim() || !testResult?.success || !rtdb) return;
    setSaving(true);
    await set(ref(rtdb, `workspaces/${workspaceId}/telegramConfig`), {
      action: "save", token: token.trim(), sentAt: Date.now(),
    });
    setTimeout(() => setSaving(false), 3000);
  };

  const disable = async () => {
    if (!rtdb) return;
    await set(ref(rtdb, `workspaces/${workspaceId}/telegramConfig`), {
      action: "disable", sentAt: Date.now(),
    });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h3 style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:3 }}>
            Telegram Bot
          </h3>
          <p style={{ fontSize:11, color:"#444" }}>
            Control your agent from Telegram — anywhere, anytime
          </p>
        </div>
        {status?.enabled && (
          <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:20, background:"rgba(74,222,128,.08)", border:"1px solid rgba(74,222,128,.2)" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 5px #4ade80" }}/>
            <span style={{ fontSize:11, color:"#4ade80", fontWeight:700 }}>Connected</span>
          </div>
        )}
      </div>

      {/* How it works */}
      <div style={{ background:"rgba(96,165,250,.05)", border:"1px solid rgba(96,165,250,.15)", borderLeft:"3px solid #60a5fa", borderRadius:9, padding:"12px 14px", fontSize:11, color:"#80b0e0", lineHeight:1.7 }}>
        <strong style={{ color:"#60a5fa" }}>How it works:</strong> Create a bot via @BotFather → paste token → send /start in Telegram → control your PC agent from anywhere.
      </div>

      {/* Setup steps */}
      {!status?.enabled && (
        <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid #111", borderRadius:10, padding:14 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#555", textTransform:"uppercase", letterSpacing:".08em", marginBottom:10 }}>
            Setup — 2 minutes
          </div>
          {[
            { n:"1", title:"Open Telegram", desc:'Search @BotFather → send /newbot' },
            { n:"2", title:"Create bot",    desc:'Follow prompts → copy the API token' },
            { n:"3", title:"Paste below",   desc:'Test connection → save' },
          ].map(step => (
            <div key={step.n} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:"1px solid #0d0d0d" }}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:"rgba(255,59,48,.1)", border:"1px solid rgba(255,59,48,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#FF3B30", flexShrink:0 }}>
                {step.n}
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:"#ccc" }}>{step.title}</div>
                <div style={{ fontSize:11, color:"#444", marginTop:1 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Token input */}
      {!status?.enabled && (
        <div>
          <label style={{ fontSize:11, color:"#555", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:".08em", fontWeight:700 }}>
            Bot Token
          </label>
          <input value={token} onChange={e => { setToken(e.target.value); setTestResult(null); }}
            placeholder="1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ"
            type="password"
            style={{ width:"100%", background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:8, padding:"9px 12px", color:"#ddd", fontSize:12, outline:"none", fontFamily:"monospace", marginBottom:8 }}
          />
          {testResult && (
            <div style={{ padding:"9px 12px", borderRadius:8, marginBottom:8, fontSize:12, background: testResult.success ? "rgba(74,222,128,.07)" : "rgba(255,59,48,.07)", border:`1px solid ${testResult.success ? "rgba(74,222,128,.2)" : "rgba(255,59,48,.2)"}`, color: testResult.success ? "#4ade80" : "#FF3B30" }}>
              {testResult.success ? `✅ Connected — @${testResult.botName || "bot"} is ready` : `❌ ${testResult.error}`}
            </div>
          )}
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={testToken} disabled={!token.trim() || testing}
              style={{ flex:1, padding:"9px 0", borderRadius:8, border:"1px solid rgba(255,59,48,.25)", background:"rgba(255,59,48,.08)", color:"#FF3B30", fontSize:12, fontWeight:700, cursor:"pointer", opacity: !token.trim() || testing ? .5 : 1 }}>
              {testing ? "Testing..." : "Test Connection"}
            </button>
            <button onClick={saveToken} disabled={!testResult?.success || saving}
              style={{ flex:1, padding:"9px 0", borderRadius:8, border:"none", background: testResult?.success ? "linear-gradient(135deg,#FF3B30,#CC1A10)" : "rgba(255,255,255,.05)", color: testResult?.success ? "#fff" : "#444", fontSize:12, fontWeight:700, cursor:"pointer", opacity: !testResult?.success || saving ? .6 : 1 }}>
              {saving ? "Saving..." : "Save & Enable"}
            </button>
          </div>
        </div>
      )}

      {/* Connected state */}
      {status?.enabled && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ background:"rgba(74,222,128,.04)", border:"1px solid rgba(74,222,128,.15)", borderRadius:10, padding:14 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#4ade80", marginBottom:10 }}>✅ Bot Connected</div>
            <div style={{ fontSize:11, color:"#666", lineHeight:1.7 }}>
              Send <code style={{ background:"#111", padding:"1px 5px", borderRadius:4 }}>/start</code> in Telegram to connect your chat.<br/>
              Then send any command — agent will execute on your PC.
            </div>
          </div>

          {/* Commands */}
          <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid #111", borderRadius:10, padding:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:".08em", marginBottom:10 }}>
              Available Commands
            </div>
            {[
              { cmd:"/brief",          desc:"Daily morning briefing" },
              { cmd:"/status",         desc:"Agent + business status" },
              { cmd:"/task [command]", desc:"Run any task on PC" },
              { cmd:"/team [agent] [msg]", desc:"Talk to specialist agent" },
              { cmd:"/screenshot",     desc:"Take PC screenshot" },
              { cmd:"/opportunities",  desc:"Find business opportunities" },
              { cmd:"Any text",        desc:"Runs directly as agent command" },
            ].map(c => (
              <div key={c.cmd} style={{ display:"flex", gap:10, padding:"6px 0", borderBottom:"1px solid #0d0d0d" }}>
                <code style={{ fontSize:11, color:"#FF3B30", background:"rgba(255,59,48,.08)", padding:"1px 7px", borderRadius:5, flexShrink:0 }}>{c.cmd}</code>
                <span style={{ fontSize:11, color:"#555" }}>{c.desc}</span>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          {activity && (
            <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid #111", borderRadius:10, padding:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#444", textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>
                Last Activity
              </div>
              <div style={{ fontSize:11, color:"#666", marginBottom:4 }}>
                Message: <span style={{ color:"#aaa" }}>{activity.lastMessage}</span>
              </div>
              <div style={{ fontSize:11, color:"#666", marginBottom:4 }}>
                Response: <span style={{ color:"#aaa" }}>{activity.lastResponse?.slice(0, 80)}...</span>
              </div>
              <div style={{ fontSize:10, color:"#333" }}>
                {new Date(activity.timestamp).toLocaleTimeString()}
              </div>
            </div>
          )}

          <button onClick={disable}
            style={{ padding:"9px 0", borderRadius:8, border:"1px solid rgba(255,59,48,.15)", background:"rgba(255,59,48,.05)", color:"#FF3B30", fontSize:12, cursor:"pointer" }}>
            Disconnect Telegram
          </button>
        </div>
      )}
    </div>
  );
}