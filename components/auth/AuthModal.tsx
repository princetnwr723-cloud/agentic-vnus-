"use client";
import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import toast from "react-hot-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Sync defaultTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setName(""); setEmail(""); setPassword("");
    }
  }, [isOpen, defaultTab]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Email aur password daalo!");
    if (tab === "signup" && !name) return toast.error("Apna naam daalo!");
    if (password.length < 6) return toast.error("Password kam se kam 6 characters ka hona chahiye!");

    setLoading(true);
    try {
      if (tab === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        toast.success(`Welcome, ${name}! 😈`);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        toast.success(`Wapas aa gaye, ${cred.user.displayName || "bhai"}! 😈`);
      }
      onClose();
      window.location.href = tab === "signup" ? "/onboarding" : "/dashboard";
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") toast.error("Ye email pehle se registered hai!");
      else if (code === "auth/user-not-found") toast.error("Account nahi mila, pehle sign up karo!");
      else if (code === "auth/wrong-password") toast.error("Password galat hai!");
      else if (code === "auth/invalid-email") toast.error("Valid email daalo!");
      else toast.error("Kuch gadbad ho gayi, dobara try karo!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Google se login ho gaya! 😈");
      onClose();
      window.location.href = tab === "signup" ? "/onboarding" : "/dashboard";
    } catch {
      toast.error("Google login failed, dobara try karo!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md z-10">
        {/* Glow behind modal */}
        <div
          className="absolute -inset-1 rounded-2xl opacity-30 blur-xl"
          style={{ background: "linear-gradient(135deg, #FF3B30, #CC1A10)" }}
          aria-hidden
        />

        <div
          className="relative rounded-2xl border border-[#FF3B30]/20 overflow-hidden"
          style={{ background: "rgba(10,5,5,0.97)" }}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-white/5">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Mini demon icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl border border-[#FF3B30]/30 bg-[#FF3B30]/10 flex items-center justify-center">
                <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
                  <path d="M10 10 C9 7,11 5,12 7 C13 5,14 7,13 10Z" fill="#FF3B30"/>
                  <path d="M22 10 C21 7,23 5,24 7 C25 5,22 7,23 10Z" fill="#FF3B30"/>
                  <ellipse cx="16" cy="18" rx="10" ry="11" fill="#1a1a1a" stroke="#440000" strokeWidth="1"/>
                  <circle cx="13" cy="16" r="2.5" fill="#FF3B30"/>
                  <circle cx="19" cy="16" r="2.5" fill="#FF3B30"/>
                  <circle cx="13" cy="16" r="1.2" fill="#000"/>
                  <circle cx="19" cy="16" r="1.2" fill="#000"/>
                  <path d="M13 22 Q16 25 19 22" stroke="#660000" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <path d="M14 23 L13 26 L15 23Z" fill="#ddd"/>
                  <path d="M18 23 L17 26 L19 23Z" fill="#ddd"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-base">Vnus AI</p>
                <p className="text-gray-500 text-xs">Agentic Vnus</p>
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex bg-white/5 rounded-xl p-1 gap-1">
              {(["login", "signup"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    tab === t
                      ? "bg-[#FF3B30] text-white shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {t === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {/* Google button */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all mb-4 disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google se {tab === "login" ? "Login" : "Sign Up"} karo
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-600 text-xs">ya email se</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
              {tab === "signup" && (
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Tumhara Naam</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jaise: Rahul"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/50 focus:bg-white/8 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tumhari@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/50 focus:bg-white/8 transition-all"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPass ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {tab === "login" && (
                <div className="text-right">
                  <button type="button" className="text-xs text-[#FF3B30] hover:underline">
                    Password bhool gaye?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-bold text-sm mt-1 transition-all disabled:opacity-50 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #FF3B30, #CC1A10)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    {tab === "login" ? "Login ho raha hai..." : "Account ban raha hai..."}
                  </span>
                ) : (
                  tab === "login" ? "😈 Login karo" : "😈 Account banao"
                )}
              </button>
            </form>

            {/* Switch tab */}
            <p className="text-center text-gray-500 text-xs mt-4">
              {tab === "login" ? "Abhi tak account nahi hai? " : "Pehle se account hai? "}
              <button
                onClick={() => setTab(tab === "login" ? "signup" : "login")}
                className="text-[#FF3B30] hover:underline font-semibold"
              >
                {tab === "login" ? "Sign Up karo" : "Login karo"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}