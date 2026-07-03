"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth as firebaseAuth } from "@/lib/firebase";
import toast from "react-hot-toast";

const PROFESSIONS = [
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>, label: "Developer" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>, label: "Designer" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, label: "Product Manager" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>, label: "Founder / CEO" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, label: "Marketer" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>, label: "Student" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>, label: "Content Creator" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>, label: "Researcher" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>, label: "Freelancer" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, label: "Other" },
];

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { window.location.href = "/"; return; }

    // If user already has profile → go to dashboard directly
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) window.location.href = "/dashboard";
      else {
        setName(user.displayName || "");
        setChecking(false);
      }
    }).catch(() => setChecking(false));
  }, [user, loading]);

  const handleFinish = async () => {
    if (!name.trim()) return toast.error("Please enter your name!");
    if (!profession) return toast.error("Please select your profession!");
    if (!user) return;

    setSaving(true);
    try {
      // Update Firebase Auth display name
      await updateProfile(user, { displayName: name.trim() });

      // Save to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        profession,
        email: user.email,
        uid: user.uid,
        createdAt: new Date().toISOString(),
        plan: "beta",
        tasksUsed: 0,
      });

      toast.success("All set! Welcome to Vnus AI 😈");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      toast.error("Failed to save. Please try again!");
      setSaving(false);
    }
  };

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-7 h-7 text-[#FF3B30]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        {Array.from({ length: 70 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 1.5 + 0.4 + "px",
              height: Math.random() * 1.5 + 0.4 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.1,
              animation: `starTwinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: Math.random() * 4 + "s",
            }}
          />
        ))}
      </div>
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(120,15,15,0.2) 0%, transparent 70%)" }}
        aria-hidden />

      <div className="relative z-10 w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-400 ${
                step >= s ? "bg-[#FF3B30] text-white" : "bg-white/5 border border-white/10 text-gray-600"
              }`}>
                {step > s ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : s}
              </div>
              {s < 2 && (
                <div className={`w-16 h-px transition-all duration-400 ${step > s ? "bg-[#FF3B30]" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#FF3B30]/15 overflow-hidden"
          style={{ background: "rgba(8,4,4,0.97)" }}>
          <div className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, #FF3B30, transparent)" }} />

          <div className="p-7">
            {step === 1 ? (
              <div key="step1" style={{ animation: "slideUp 0.4s ease forwards" }}>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-center justify-center mx-auto mb-4">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <h1 className="text-2xl font-black text-white mb-2">What should we call you?</h1>
                  <p className="text-gray-500 text-sm">Your name will appear across your dashboard.</p>
                </div>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) setStep(2); }}
                  placeholder="Your name..."
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/50 transition-all mb-5"
                />

                <button
                  onClick={() => { if (name.trim()) setStep(2); else toast.error("Please enter your name!"); }}
                  className="btn-primary w-full py-3.5 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2"
                >
                  Continue
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div key="step2" style={{ animation: "slideUp 0.4s ease forwards" }}>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-center justify-center mx-auto mb-4">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                    </svg>
                  </div>
                  <h1 className="text-2xl font-black text-white mb-2">What do you do?</h1>
                  <p className="text-gray-500 text-sm">Help us personalize Vnus for your workflow, {name}.</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  {PROFESSIONS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => setProfession(p.label)}
                      className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                        profession === p.label
                          ? "border-[#FF3B30] bg-[#FF3B30]/12 text-white"
                          : "border-white/8 bg-white/3 text-gray-400 hover:border-white/15 hover:text-white"
                      }`}
                    >
                      <span className={profession === p.label ? "text-[#FF3B30]" : "text-gray-500"}>
                        {p.icon}
                      </span>
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="btn-ghost px-5 py-3.5 rounded-xl text-gray-400 font-semibold text-sm">
                    Back
                  </button>
                  <button
                    onClick={handleFinish}
                    disabled={saving || !profession}
                    className="btn-primary flex-1 py-3.5 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>Setting up...</>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Enter Vnus AI
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-gray-700 text-xs mt-4">
          Need help?{" "}
          <a href="mailto:hello@vnus.ai" className="text-[#FF3B30] hover:underline">hello@vnus.ai</a>
        </p>
      </div>
    </div>
  );
}