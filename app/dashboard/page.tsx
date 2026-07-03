"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

const PROFESSIONS = [
  { icon: "💻", label: "Developer" },
  { icon: "🎨", label: "Designer" },
  { icon: "📊", label: "Product Manager" },
  { icon: "🚀", label: "Founder / CEO" },
  { icon: "📈", label: "Marketer" },
  { icon: "🎓", label: "Student" },
  { icon: "✍️", label: "Content Creator" },
  { icon: "🔬", label: "Researcher" },
  { icon: "💼", label: "Freelancer" },
  { icon: "🌟", label: "Other" },
];

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) window.location.href = "/";
    if (user?.displayName) setName(user.displayName);
  }, [user, loading]);

  const handleFinish = async () => {
    if (!name.trim()) return toast.error("Please enter your name!");
    if (!profession) return toast.error("Please select your profession!");
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName: name.trim() });
      await setDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        profession,
        email: user.email,
        createdAt: new Date().toISOString(),
        plan: "beta",
      });
      toast.success("Welcome to Vnus AI! 😈");
      window.location.href = "/dashboard";
    } catch {
      toast.error("Something went wrong. Try again!");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <svg className="animate-spin w-8 h-8 text-[#FF3B30]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        {Array.from({ length: 80 }).map((_, i) => (
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

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(120,15,15,0.2) 0%, transparent 70%)" }} aria-hidden />

      <div className="relative z-10 w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 justify-center mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step >= s ? "bg-[#FF3B30] text-white" : "bg-white/5 border border-white/10 text-gray-600"
              }`}>{s}</div>
              {s < 2 && <div className={`w-12 h-px transition-all duration-300 ${step > s ? "bg-[#FF3B30]" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#FF3B30]/15 overflow-hidden" style={{ background: "rgba(10,5,5,0.96)" }}>
          {/* Top glow line */}
          <div className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, #FF3B30, transparent)" }} />

          <div className="p-8">
            {step === 1 ? (
              /* Step 1 — Name */
              <div style={{ animation: "slideUp 0.5s ease forwards" }}>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <h1 className="text-2xl font-black text-white mb-2">What should we call you?</h1>
                  <p className="text-gray-500 text-sm">Your name will appear on your dashboard.</p>
                </div>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-base placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/50 transition-all mb-6"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) setStep(2); }}
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
              /* Step 2 — Profession */
              <div style={{ animation: "slideUp 0.5s ease forwards" }}>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                    </svg>
                  </div>
                  <h1 className="text-2xl font-black text-white mb-2">What do you do?</h1>
                  <p className="text-gray-500 text-sm">Help us personalize Vnus for your workflow.</p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mb-6">
                  {PROFESSIONS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => setProfession(p.label)}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                        profession === p.label
                          ? "border-[#FF3B30] bg-[#FF3B30]/12 text-white"
                          : "border-white/8 bg-white/3 text-gray-400 hover:border-white/15 hover:text-white"
                      }`}
                    >
                      <span className="text-base">{p.icon}</span>
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-ghost px-5 py-3.5 rounded-xl text-gray-400 font-semibold text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleFinish}
                    disabled={saving || !profession}
                    className="btn-primary flex-1 py-3.5 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
                      </svg>
                    ) : "😈"}
                    {saving ? "Setting up..." : "Enter Vnus AI"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          Already have an account?{" "}
          <a href="/" className="text-[#FF3B30] hover:underline">Go to home</a>
        </p>
      </div>
    </div>
  );
}