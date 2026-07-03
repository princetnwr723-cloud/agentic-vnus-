"use client";
import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import toast from "react-hot-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (isOpen) { setTab(defaultTab); setEmail(""); setPassword(""); }
  }, [isOpen, defaultTab]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  // After login: check if user has Firestore profile → dashboard or onboarding
  const redirectAfterLogin = async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      window.location.href = snap.exists() ? "/dashboard" : "/onboarding";
    } catch {
      window.location.href = "/onboarding";
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please enter email and password!");
    if (password.length < 6) return toast.error("Password must be at least 6 characters!");

    setLoading(true);
    try {
      if (tab === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        onClose();
        // New user → always onboarding
        window.location.href = "/onboarding";
        toast.success("Account created! Let's set you up 😈");
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        onClose();
        toast.success(`Welcome back! 😈`);
        await redirectAfterLogin(cred.user.uid);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") toast.error("Email already registered! Please login.");
      else if (code === "auth/user-not-found" || code === "auth/invalid-credential") toast.error("Account not found. Please sign up first!");
      else if (code === "auth/wrong-password") toast.error("Wrong password!");
      else if (code === "auth/invalid-email") toast.error("Enter a valid email address!");
      else if (code === "auth/too-many-requests") toast.error("Too many attempts. Try again later.");
      else toast.error("Something went wrong. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      onClose();
      toast.success("Signed in with Google! 😈");
      await redirectAfterLogin(cred.user.uid);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code !== "auth/popup-closed-by-user") toast.error("Google sign-in failed. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-md z-10">
        <div className="absolute -inset-1 rounded-2xl opacity-25 blur-xl"
          style={{ background: "linear-gradient(135deg, #FF3B30, #CC1A10)" }} aria-hidden />

        <div className="relative rounded-2xl border border-[#FF3B30]/20 overflow-hidden"
          style={{ background: "rgba(8,4,4,0.98)" }}>

          {/* Top glow line */}
          <div className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, #FF3B30, transparent)" }} />

          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-white/5">
            <button onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl border border-[#FF3B30]/30 bg-[#FF3B30]/10 flex items-center justify-center">
                <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
                  <circle cx="16" cy="16" r="14" fill="#1a0505" stroke="#FF3B30" strokeWidth="1.5"/>
                  <path d="M11 11C10 8 12 6 13 8 14 6 15 8 14 11Z" fill="#FF3B30"/>
                  <path d="M21 11C20 8 22 6 23 8 24 6 21 8 22 11Z" fill="#FF3B30"/>
                  <circle cx="13" cy="16" r="2.2" fill="#FF3B30"/>
                  <circle cx="19" cy="16" r="2.2" fill="#FF3B30"/>
                  <circle cx="13" cy="16" r="1" fill="#000"/>
                  <circle cx="19" cy="16" r="1" fill="#000"/>
                  <path d="M13 21 Q16 24 19 21" stroke="#660000" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-base leading-none">Vnus AI</p>
                <p className="text-gray-500 text-xs mt-0.5">Agentic Vnus</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white/5 rounded-xl p-1 gap-1">
              {(["login", "signup"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    tab === t ? "bg-[#FF3B30] text-white shadow-lg" : "text-gray-400 hover:text-white"
                  }`}>
                  {t === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {/* Google */}
            <button onClick={handleGoogle} disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all mb-4 disabled:opacity-50">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-gray-600 text-xs">or continue with email</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" autoComplete="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/50 transition-all"/>
              </div>

              <div>
                <label className="text-gray-400 text-xs mb-1.5 block">Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters" autoComplete={tab === "signup" ? "new-password" : "current-password"}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FF3B30]/50 transition-all"/>
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                    {showPass
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              {tab === "login" && (
                <div className="text-right -mt-1">
                  <button type="button" className="text-xs text-[#FF3B30] hover:underline">Forgot password?</button>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-white font-bold text-sm mt-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #FF3B30, #CC1A10)" }}>
                {loading ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>
                  {tab === "login" ? "Signing in..." : "Creating account..."}</>
                ) : tab === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <p className="text-center text-gray-500 text-xs mt-4">
              {tab === "login" ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setTab(tab === "login" ? "signup" : "login")}
                className="text-[#FF3B30] hover:underline font-semibold">
                {tab === "login" ? "Sign up free" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}