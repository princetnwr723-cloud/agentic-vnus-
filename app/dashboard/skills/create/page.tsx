"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

// ── Icons ──────────────────────────────────────────────────
const IC = {
  back:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  ai:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
  code:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  plus:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>,
  spark:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  check:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  copy:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  share:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  save:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
};

const CATEGORIES = ["Productivity", "Communication", "Developer", "Entertainment", "Shopping", "Finance", "Health", "Other"];
const APP_OPTIONS = ["Chrome", "Gmail", "Outlook", "Spotify", "WhatsApp", "Telegram", "VS Code", "Terminal", "Notepad", "Files", "Calendar", "Excel"];

// ── AI Builder (Non-tech) ──────────────────────────────────
function AIBuilder({ onGenerated }: { onGenerated: (skill: GeneratedSkill) => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [examples, setExamples] = useState(["", "", ""]);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [category, setCategory] = useState("Productivity");
  const [generating, setGenerating] = useState(false);

  const addExample = () => setExamples([...examples, ""]);
  const removeExample = (i: number) => setExamples(examples.filter((_, idx) => idx !== i));
  const updateExample = (i: number, val: string) => {
    const updated = [...examples];
    updated[i] = val;
    setExamples(updated);
  };

  const toggleApp = (app: string) => {
    setSelectedApps(prev =>
      prev.includes(app) ? prev.filter(a => a !== app) : [...prev, app]
    );
  };

  const handleGenerate = async () => {
    if (!name.trim()) return toast.error("Please enter a skill name!");
    if (!description.trim()) return toast.error("Please describe what the skill should do!");
    const validExamples = examples.filter(e => e.trim());
    if (validExamples.length === 0) return toast.error("Add at least one example command!");

    setGenerating(true);

    try {
      const response = await fetch("/api/generate-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, examples: validExamples, apps: selectedApps, category }),
      });

      const data = await response.json();
      if (data.skill) {
        onGenerated(data.skill);
        toast.success("Skill generated successfully!");
      } else {
        toast.error("Generation failed. Please try again!");
      }
    } catch {
      toast.error("Something went wrong. Try again!");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= s ? "bg-[#FF3B30] text-white" : "bg-white/5 border border-white/10 text-gray-600"
            }`}>
              {step > s ? IC.check : s}
            </div>
            {s < 3 && <div className={`w-12 h-px transition-all ${step > s ? "bg-[#FF3B30]" : "bg-white/10"}`} />}
          </div>
        ))}
        <span className="text-gray-500 text-xs ml-2">
          {step === 1 ? "Basic Info" : step === 2 ? "Examples" : "Apps & Category"}
        </span>
      </div>

      {/* Step 1 — Name & Description */}
      {step === 1 && (
        <div style={{ animation: "slideUp 0.4s ease forwards" }}>
          <h2 className="text-white font-black text-2xl mb-1">What should your skill do?</h2>
          <p className="text-gray-500 text-sm mb-6">Describe it in plain English — no coding needed.</p>

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs mb-1.5 block font-medium">Skill Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Spotify Controller, Email Cleaner..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/50 transition-all" />
            </div>

            <div>
              <label className="text-gray-400 text-xs mb-1.5 block font-medium">What should it do?</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Control Spotify — play songs, pause, skip tracks, search for music and adjust volume..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/50 transition-all resize-none" />
              <p className="text-gray-600 text-xs mt-1">Be as detailed as possible — the more you describe, the better the skill!</p>
            </div>
          </div>

          <button onClick={() => {
            if (!name.trim() || !description.trim()) return toast.error("Fill in name and description first!");
            setStep(2);
          }} className="btn-primary w-full py-3 rounded-xl text-white font-bold text-sm mt-6 flex items-center justify-center gap-2">
            Continue
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      )}

      {/* Step 2 — Example Commands */}
      {step === 2 && (
        <div style={{ animation: "slideUp 0.4s ease forwards" }}>
          <h2 className="text-white font-black text-2xl mb-1">Give some example commands</h2>
          <p className="text-gray-500 text-sm mb-6">These help the AI understand how people will use your skill.</p>

          <div className="space-y-2.5 mb-4">
            {examples.map((ex, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
                  </svg>
                  <input type="text" value={ex} onChange={e => updateExample(i, e.target.value)}
                    placeholder={`Example command ${i + 1}...`}
                    className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 focus:outline-none" />
                </div>
                {examples.length > 1 && (
                  <button onClick={() => removeExample(i)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/8 text-gray-600 hover:text-red-400 hover:border-red-500/20 transition-all">
                    {IC.trash}
                  </button>
                )}
              </div>
            ))}
          </div>

          <button onClick={addExample}
            className="w-full py-2.5 rounded-xl border border-dashed border-white/15 text-gray-500 hover:text-white hover:border-white/25 text-xs flex items-center justify-center gap-1.5 transition-all mb-6">
            {IC.plus} Add another example
          </button>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-ghost px-5 py-3 rounded-xl text-gray-400 font-semibold text-sm">Back</button>
            <button onClick={() => {
              if (examples.filter(e => e.trim()).length === 0) return toast.error("Add at least one example!");
              setStep(3);
            }} className="btn-primary flex-1 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2">
              Continue
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Apps & Category */}
      {step === 3 && (
        <div style={{ animation: "slideUp 0.4s ease forwards" }}>
          <h2 className="text-white font-black text-2xl mb-1">Which apps will it use?</h2>
          <p className="text-gray-500 text-sm mb-6">Select all apps this skill might need to control.</p>

          {/* App grid */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {APP_OPTIONS.map((app) => (
              <button key={app} onClick={() => toggleApp(app)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                  selectedApps.includes(app)
                    ? "border-[#FF3B30] bg-[#FF3B30]/10 text-white"
                    : "border-white/8 bg-white/3 text-gray-400 hover:border-white/15 hover:text-white"
                }`}>
                {app}
              </button>
            ))}
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="text-gray-400 text-xs mb-2 block font-medium">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`py-2 rounded-xl border text-xs font-medium transition-all ${
                    category === cat
                      ? "border-[#FF3B30] bg-[#FF3B30]/10 text-white"
                      : "border-white/8 bg-white/3 text-gray-400 hover:border-white/15 hover:text-white"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-ghost px-5 py-3 rounded-xl text-gray-400 font-semibold text-sm">Back</button>
            <button onClick={handleGenerate} disabled={generating}
              className="btn-primary flex-1 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {generating ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>Generating Skill...</>
              ) : (
                <>{IC.spark} Generate Skill with AI</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Code Editor (Tech users) ───────────────────────────────
const TEMPLATE = `module.exports = {
  id: "my-skill",
  name: "My Custom Skill",
  version: "1.0.0",
  author: "Your Name",
  description: "Describe what your skill does",
  category: "productivity",
  price: "free",

  // AI instructions for this skill
  systemPrompt: \`
    You are a specialist for [your skill area].
    
    You can perform these tasks:
    - Task 1
    - Task 2
    - Task 3
    
    Always [important instruction here].
  \`,

  // Actions this skill supports
  actions: ["action_1", "action_2", "action_3"],

  // Required permissions
  permissions: ["browser"],

  // Example commands users can try
  examples: [
    "Do task 1",
    "Do task 2",
    "Do task 3",
  ],
};`;

function CodeEditor({ onSave }: { onSave: (code: string) => void }) {
  const [code, setCode] = useState(TEMPLATE);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white font-black text-xl">Code Editor</h2>
          <p className="text-gray-500 text-sm mt-0.5">Write your skill in JavaScript — full control</p>
        </div>
        <a href="https://docs.vnus.ai/skills" target="_blank" rel="noopener noreferrer"
          className="text-[#FF3B30] text-xs hover:underline">
          View Docs
        </a>
      </div>

      {/* Editor */}
      <div className="rounded-xl border border-white/10 overflow-hidden mb-4">
        {/* Editor header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-gray-500 text-xs ml-2 font-mono">skill.js</span>
          </div>
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 text-gray-500 hover:text-white text-xs transition-colors">
            {copied ? IC.check : IC.copy}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          className="w-full bg-[#0d0d0d] text-green-400 font-mono text-xs p-5 focus:outline-none resize-none"
          style={{ minHeight: "420px", lineHeight: "1.6" }}
          spellCheck={false}
        />
      </div>

      {/* Tips */}
      <div className="glass-card rounded-xl p-4 mb-5">
        <p className="text-gray-400 text-xs font-semibold mb-2">Tips for writing skills:</p>
        <ul className="space-y-1.5">
          {[
            "The systemPrompt tells the AI what your skill specializes in",
            "Add detailed instructions for better accuracy",
            "List all example commands users might try",
            "permissions: browser, files, terminal, network",
            "Test your skill before sharing to the marketplace",
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-600 text-xs">
              <span className="text-[#FF3B30] mt-0.5 shrink-0">›</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={() => onSave(code)}
        className="btn-primary w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2">
        {IC.save} Save Skill
      </button>
    </div>
  );
}

// ── Generated Skill Preview ────────────────────────────────
interface GeneratedSkill {
  id: string;
  name: string;
  description: string;
  category: string;
  systemPrompt: string;
  actions: string[];
  examples: string[];
  permissions: string[];
  price: string;
}

function SkillPreview({ skill, onSave, onEdit }: {
  skill: GeneratedSkill;
  onSave: () => void;
  onEdit: () => void;
}) {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="max-w-2xl mx-auto" style={{ animation: "slideUp 0.5s ease forwards" }}>
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
          {IC.check}
        </div>
        <h2 className="text-white font-black text-2xl mb-2">Skill Generated!</h2>
        <p className="text-gray-500 text-sm">Your skill is ready. Test it, save it or share it to the marketplace.</p>
      </div>

      {/* Skill card preview */}
      <div className="glass-card rounded-2xl p-6 mb-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right,transparent,#FF3B30,transparent)" }} />

        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-lg">{skill.name}</h3>
            <span className="text-xs bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/15 px-2 py-0.5 rounded-full mt-1 inline-block">
              {skill.category}
            </span>
          </div>
          <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full font-semibold">
            {skill.price === "free" ? "Free" : "Pro"}
          </span>
        </div>

        <p className="text-gray-400 text-sm mb-4">{skill.description}</p>

        {/* Generated system prompt preview */}
        <div className="mb-4">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">AI Instructions (Generated)</p>
          <div className="bg-black/30 border border-white/5 rounded-xl p-3 max-h-32 overflow-y-auto">
            <p className="text-gray-500 text-xs font-mono leading-relaxed whitespace-pre-wrap">{skill.systemPrompt}</p>
          </div>
        </div>

        {/* Examples */}
        <div className="mb-4">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Example Commands</p>
          <div className="space-y-1.5">
            {skill.examples.map((ex, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/3 border border-white/5 rounded-lg px-3 py-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
                </svg>
                <span className="text-gray-300 text-xs font-mono">{ex}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="flex flex-wrap gap-1.5">
          {skill.permissions.map((p) => (
            <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-gray-500">
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 gap-3">
        <button onClick={onSave}
          className="btn-primary py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2">
          {IC.save} Save to My Skills
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onEdit}
            className="btn-ghost py-3 rounded-xl text-gray-300 font-semibold text-sm flex items-center justify-center gap-2">
            Edit Skill
          </button>
          <button onClick={() => setShareOpen(true)}
            className="btn-ghost py-3 rounded-xl text-gray-300 font-semibold text-sm flex items-center justify-center gap-2">
            {IC.share} Share to Market
          </button>
        </div>
      </div>

      {/* Share modal */}
      {shareOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShareOpen(false); }}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-md z-10 rounded-2xl border border-[#FF3B30]/20 p-6 overflow-hidden"
            style={{ background: "rgba(8,4,4,0.98)" }}>
            <div className="h-px w-full mb-5" style={{ background: "linear-gradient(to right,transparent,#FF3B30,transparent)" }} />
            <h3 className="text-white font-bold text-base mb-2">Share to Marketplace</h3>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              Your skill will be reviewed by the Vnus AI team before going live on the marketplace. Usually takes 24-48 hours.
            </p>
            <div className="glass-card rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-semibold">{skill.name}</p>
                  <p className="text-gray-500 text-xs">{skill.category}</p>
                </div>
                <span className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">Pending Review</span>
              </div>
            </div>
            <button onClick={() => { setShareOpen(false); toast.success("Submitted for review! We will notify you."); }}
              className="btn-primary w-full py-3 rounded-xl text-white font-bold text-sm">
              Submit for Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Create Skill Page ─────────────────────────────────
export default function CreateSkillPage() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const defaultMode = searchParams.get("mode") === "code" ? "code" : "ai";
  const [mode, setMode] = useState<"ai" | "code">(defaultMode as "ai" | "code");
  const [generatedSkill, setGeneratedSkill] = useState<GeneratedSkill | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) window.location.href = "/";
  }, [user, loading]);

  const handleSaveSkill = async (skill: GeneratedSkill | string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "users", user.uid, "skills"), {
        ...(typeof skill === "string" ? { code: skill, type: "code" } : { ...skill, type: "ai" }),
        createdAt: serverTimestamp(),
        userId: user.uid,
      });
      setSaved(true);
      toast.success("Skill saved successfully!");
    } catch {
      toast.error("Failed to save. Try again!");
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <svg className="animate-spin w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2.5">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="text-center" style={{ animation: "slideUp 0.5s ease forwards" }}>
          <div className="w-20 h-20 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="text-white font-black text-2xl mb-2">Skill Saved!</h2>
          <p className="text-gray-500 text-sm mb-6">Your skill is ready to use in your workspaces.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard/marketplace" className="btn-primary px-6 py-2.5 rounded-xl text-white font-bold text-sm">
              Back to Marketplace
            </Link>
            <button onClick={() => { setSaved(false); setGeneratedSkill(null); }}
              className="btn-ghost px-6 py-2.5 rounded-xl text-gray-300 font-semibold text-sm">
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 1.5 + 0.4 + "px",
              height: Math.random() * 1.5 + 0.4 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.4 + 0.1,
              animation: `starTwinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/marketplace" className="text-gray-500 hover:text-white transition-colors">
            {IC.back}
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">Create New Skill</h1>
            <p className="text-gray-500 text-sm mt-0.5">Build with AI or write your own code</p>
          </div>
        </div>

        {/* Mode switcher — only show if no skill generated yet */}
        {!generatedSkill && (
          <div className="flex bg-white/5 rounded-xl p-1 gap-1 mb-8 max-w-xs">
            <button onClick={() => setMode("ai")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                mode === "ai" ? "bg-[#FF3B30] text-white" : "text-gray-400 hover:text-white"
              }`}>
              {IC.spark} Build with AI
            </button>
            <button onClick={() => setMode("code")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                mode === "code" ? "bg-[#FF3B30] text-white" : "text-gray-400 hover:text-white"
              }`}>
              {IC.code} Write Code
            </button>
          </div>
        )}

        {/* Content */}
        {generatedSkill ? (
          <SkillPreview
            skill={generatedSkill}
            onSave={() => handleSaveSkill(generatedSkill)}
            onEdit={() => setGeneratedSkill(null)}
          />
        ) : mode === "ai" ? (
          <AIBuilder onGenerated={setGeneratedSkill} />
        ) : (
          <CodeEditor onSave={(code) => handleSaveSkill(code)} />
        )}
      </div>
    </div>
  );
}