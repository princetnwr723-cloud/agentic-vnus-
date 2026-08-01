"use client";
// components/SchedulerSection.tsx
// Full Scheduler UI — create, edit, delete, run cron jobs from workspace

import { useState, useEffect } from "react";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, set, remove } from "firebase/database";

interface Schedule {
  id:              string;
  name:            string;
  command:         string;
  triggerType:     string;
  cronExpr?:       string;
  dailyTime?:      string;
  intervalMinutes?: number;
  condition?:      string;
  watchPath?:      string;
  timezone:        string;
  enabled:         boolean;
  retryOnFail:     boolean;
  runCount:        number;
  lastRan?:        string;
  lastSuccess?:    boolean;
  createdAt:       string;
}

interface SchedulerSectionProps {
  workspaceId: string;
}

const TRIGGER_LABELS: Record<string, string> = {
  daily:     "Every Day",
  interval:  "Every N Minutes",
  cron:      "Custom Cron",
  condition: "When Condition Met",
  file:      "When File Changes",
  startup:   "On Agent Start",
};

const TRIGGER_COLORS: Record<string, string> = {
  daily:     "#60a5fa",
  interval:  "#4ade80",
  cron:      "#fbbf24",
  condition: "#f97316",
  file:      "#a855f7",
  startup:   "#FF3B30",
};

const TIMEZONES = [
  "Asia/Kolkata", "America/New_York", "America/Los_Angeles",
  "Europe/London", "Asia/Tokyo", "Australia/Sydney",
];

function NewScheduleModal({ onClose, onSave }: {
  onClose: () => void;
  onSave:  (data: Partial<Schedule>) => void;
}) {
  const [form, setForm] = useState({
    name:            "",
    command:         "",
    triggerType:     "daily",
    dailyTime:       "09:00",
    intervalMinutes: 60,
    cronExpr:        "0 9 * * *",
    condition:       "",
    watchPath:       "",
    timezone:        "Asia/Kolkata",
    retryOnFail:     true,
  });

  const upd = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm"/>
      <div className="relative w-full max-w-lg z-10 rounded-2xl border border-[#FF3B30]/20 overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ background: "rgba(8,4,4,0.98)" }}>
        <div className="h-px" style={{ background: "linear-gradient(to right,transparent,#FF3B30,transparent)" }}/>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white font-bold text-base">New Scheduled Task</h2>
              <p className="text-gray-500 text-xs mt-0.5">Automate commands to run on a schedule</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-white/10">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Task Name</label>
              <input value={form.name} onChange={e => upd("name", e.target.value)}
                placeholder="e.g. Daily news summary"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/50"/>
            </div>

            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Command</label>
              <textarea value={form.command} onChange={e => upd("command", e.target.value)}
                placeholder="e.g. Open Chrome and search for AI news"
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/50 resize-none"/>
            </div>

            <div>
              <label className="text-gray-400 text-xs mb-2 block">Trigger Type</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(TRIGGER_LABELS).map(([val, label]) => (
                  <button key={val} onClick={() => upd("triggerType", val)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${form.triggerType === val ? "text-white" : "text-gray-500 border-white/8 hover:border-white/15"}`}
                    style={form.triggerType === val ? { borderColor: TRIGGER_COLORS[val], background: TRIGGER_COLORS[val] + "18", color: TRIGGER_COLORS[val] } : {}}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {form.triggerType === "daily" && (
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Time</label>
                <input type="time" value={form.dailyTime} onChange={e => upd("dailyTime", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF3B30]/50"/>
              </div>
            )}

            {form.triggerType === "interval" && (
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Every (minutes)</label>
                <input type="number" value={form.intervalMinutes} min={5} max={1440}
                  onChange={e => upd("intervalMinutes", parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF3B30]/50"/>
              </div>
            )}

            {form.triggerType === "cron" && (
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Cron Expression</label>
                <input value={form.cronExpr} onChange={e => upd("cronExpr", e.target.value)}
                  placeholder="0 9 * * * (every day at 9am)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/50"/>
                <p className="text-gray-600 text-xs mt-1">Format: minute hour day month weekday</p>
              </div>
            )}

            {form.triggerType === "condition" && (
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Condition</label>
                <input value={form.condition} onChange={e => upd("condition", e.target.value)}
                  placeholder='e.g. file "C:/Users/user/report.csv" exists'
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/50"/>
              </div>
            )}

            {form.triggerType === "file" && (
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Watch Path</label>
                <input value={form.watchPath} onChange={e => upd("watchPath", e.target.value)}
                  placeholder="C:/Users/username/Downloads"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/50"/>
              </div>
            )}

            {["daily","interval","cron"].includes(form.triggerType) && (
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Timezone</label>
                <select value={form.timezone} onChange={e => upd("timezone", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF3B30]/50">
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-xl border border-white/8 bg-white/3">
              <div>
                <p className="text-white text-xs font-semibold">Retry on failure</p>
                <p className="text-gray-500 text-xs">Retry up to 3 times if command fails</p>
              </div>
              <button onClick={() => upd("retryOnFail", !form.retryOnFail)}
                className={`w-10 h-5 rounded-full transition-all relative ${form.retryOnFail ? "bg-[#FF3B30]" : "bg-white/10"}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${form.retryOnFail ? "right-0.5" : "left-0.5"}`}/>
              </button>
            </div>

            <button
              onClick={() => { if (!form.name || !form.command) return; onSave(form); onClose(); }}
              disabled={!form.name || !form.command}
              className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#FF3B30,#CC1A10)" }}>
              Create Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SchedulerSection({ workspaceId }: SchedulerSectionProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showNew,   setShowNew]   = useState(false);
  const [selected,  setSelected]  = useState<string | null>(null);
  const [loading,   setLoading]   = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId || !rtdb) return;
    const r = ref(rtdb, `workspaces/${workspaceId}/schedules`);
    const unsub = onValue(r, snap => {
      const data = snap.val();
      if (Array.isArray(data)) setSchedules(data);
      else if (data && typeof data === "object") setSchedules(Object.values(data));
      else setSchedules([]);
    });
    return () => unsub();
  }, [workspaceId]);

  const sendAction = async (action: object) => {
    if (!rtdb) return;
    const r = ref(rtdb, `workspaces/${workspaceId}/scheduleActions`);
    await set(r, action);
  };

  const handleCreate = async (data: Partial<Schedule>) => {
    await sendAction({ type: "CREATE", schedule: data });
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    setLoading(id);
    await sendAction({ type: "TOGGLE", scheduleId: id, enabled });
    setTimeout(() => setLoading(null), 1000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this schedule?")) return;
    await sendAction({ type: "DELETE", scheduleId: id });
  };

  const handleRunNow = async (id: string) => {
    setLoading(id);
    await sendAction({ type: "RUN_NOW", scheduleId: id });
    setTimeout(() => setLoading(null), 2000);
  };

  const EXAMPLES = [
    { name: "Daily News Check", command: "Open Chrome and search for today's AI news", triggerType: "daily", dailyTime: "09:00" },
    { name: "Hourly Screenshot", command: "Take a screenshot and save it to Desktop/screenshots", triggerType: "interval", intervalMinutes: 60 },
    { name: "Startup Tasks", command: "Open VS Code and Chrome", triggerType: "startup" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-lg">Scheduler</h2>
          <p className="text-gray-500 text-sm mt-0.5">Automate tasks to run in the background</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-sm"
          style={{ background: "linear-gradient(135deg,#FF3B30,#CC1A10)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Schedule
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Schedules", value: schedules.length },
          { label: "Active",          value: schedules.filter(s => s.enabled).length },
          { label: "Total Runs",      value: schedules.reduce((a, s) => a + (s.runCount || 0), 0) },
        ].map(stat => (
          <div key={stat.label} className="glass-card rounded-xl p-4">
            <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
            <p className="text-white font-bold text-xl">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Schedules list */}
      {schedules.length === 0 ? (
        <div>
          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <p className="text-gray-500 text-sm mb-1">No schedules yet</p>
            <p className="text-gray-600 text-xs mb-4">Create your first automated task below</p>
            <button onClick={() => setShowNew(true)}
              className="btn-primary px-5 py-2 rounded-lg text-white font-bold text-sm mx-auto flex items-center gap-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create First Schedule
            </button>
          </div>

          {/* Quick examples */}
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Quick Examples</p>
          <div className="space-y-2">
            {EXAMPLES.map(ex => (
              <button key={ex.name} onClick={() => handleCreate(ex)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/3 hover:border-[#FF3B30]/30 hover:bg-[#FF3B30]/4 transition-all text-left">
                <div>
                  <p className="text-white text-sm font-semibold">{ex.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{ex.command}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full ml-3 flex-shrink-0"
                  style={{ background: TRIGGER_COLORS[ex.triggerType] + "18", color: TRIGGER_COLORS[ex.triggerType] }}>
                  {TRIGGER_LABELS[ex.triggerType]}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map(s => (
            <div key={s.id}
              className={`rounded-xl border p-4 transition-all cursor-pointer ${selected === s.id ? "border-[#FF3B30]/40 bg-[#FF3B30]/4" : "border-white/8 bg-white/3 hover:border-white/15"}`}
              onClick={() => setSelected(selected === s.id ? null : s.id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: TRIGGER_COLORS[s.triggerType] + "18", border: `1px solid ${TRIGGER_COLORS[s.triggerType]}30` }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TRIGGER_COLORS[s.triggerType]} strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-sm font-semibold truncate">{s.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: TRIGGER_COLORS[s.triggerType] + "18", color: TRIGGER_COLORS[s.triggerType] }}>
                        {TRIGGER_LABELS[s.triggerType]}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs truncate">{s.command}</p>
                    {s.lastRan && (
                      <p className="text-gray-600 text-xs mt-1">
                        Last ran: {new Date(s.lastRan).toLocaleString()} ·{" "}
                        <span style={{ color: s.lastSuccess ? "#4ade80" : "#FF3B30" }}>
                          {s.lastSuccess ? "✓ Success" : "✗ Failed"}
                        </span>
                        {" · "}{s.runCount || 0} total runs
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  {/* Run now */}
                  <button onClick={() => handleRunNow(s.id)}
                    disabled={loading === s.id}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-40">
                    {loading === s.id
                      ? <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4"/></svg>
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    }
                  </button>

                  {/* Toggle */}
                  <button onClick={() => handleToggle(s.id, !s.enabled)}
                    className={`w-10 h-5 rounded-full transition-all relative ${s.enabled ? "bg-[#FF3B30]" : "bg-white/10"}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${s.enabled ? "right-0.5" : "left-0.5"}`}/>
                  </button>

                  {/* Delete */}
                  <button onClick={() => handleDelete(s.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-600 hover:text-red-400 hover:border-red-500/20 transition-all">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {selected === s.id && (
                <div className="mt-4 pt-4 border-t border-white/8">
                  <div className="grid grid-cols-2 gap-3">
                    {s.triggerType === "daily"    && <div><p className="text-gray-500 text-xs">Time</p><p className="text-white text-sm font-semibold">{s.dailyTime}</p></div>}
                    {s.triggerType === "interval" && <div><p className="text-gray-500 text-xs">Interval</p><p className="text-white text-sm font-semibold">Every {s.intervalMinutes} min</p></div>}
                    {s.triggerType === "cron"     && <div><p className="text-gray-500 text-xs">Cron</p><p className="text-white text-sm font-mono">{s.cronExpr}</p></div>}
                    {s.condition  && <div><p className="text-gray-500 text-xs">Condition</p><p className="text-white text-sm">{s.condition}</p></div>}
                    {s.watchPath  && <div><p className="text-gray-500 text-xs">Watch Path</p><p className="text-white text-sm font-mono text-xs">{s.watchPath}</p></div>}
                    <div><p className="text-gray-500 text-xs">Timezone</p><p className="text-white text-sm">{s.timezone}</p></div>
                    <div><p className="text-gray-500 text-xs">Retry on fail</p><p className="text-white text-sm">{s.retryOnFail ? "Yes" : "No"}</p></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showNew && <NewScheduleModal onClose={() => setShowNew(false)} onSave={handleCreate}/>}
    </div>
  );
}
