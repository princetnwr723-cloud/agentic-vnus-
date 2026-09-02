"use client";
import { useState, useRef, useEffect } from "react";
import { ref, get, update } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import toast from "react-hot-toast";

interface AddWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (workspace: WorkspaceData) => void;
}

export interface WorkspaceData {
  id: string;
  code: string;
  pcName: string;
  os: string;
  status: "online" | "offline";
  connectedAt: string;
}

export default function AddWorkspaceModal({ isOpen, onClose, onConnected }: AddWorkspaceModalProps) {
  const { user } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(10).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDigits(Array(10).fill(""));
      setError("");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInput = (index: number, value: string) => {
    const clean = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(-1);
    const newDigits = [...digits];
    newDigits[index] = clean;
    setDigits(newDigits);
    setError("");
    if (clean && index < 9) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 9) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
    const newDigits = [...digits];
    pasted.split("").forEach((char, i) => { if (i < 10) newDigits[i] = char; });
    setDigits(newDigits);
    const nextEmpty = newDigits.findIndex(d => !d);
    inputRefs.current[nextEmpty === -1 ? 9 : nextEmpty]?.focus();
  };

  // ── Connect — reads/writes Realtime Database, NOT Firestore ──
  // The Electron agent (main.js → rtdbRegisterAgent) writes the
  // connection code to RTDB at /workspaces/{code} with status:
  // "waiting". The code itself IS the RTDB key — no query needed,
  // just a direct path lookup. Firestore's agent_connections
  // collection was never where the agent actually writes to.
  const handleConnect = async () => {
    const code = digits.join("");
    if (code.length !== 10) {
      setError("Please enter all 10 digits of your code.");
      return;
    }
    if (!user) return;
    if (!rtdb) {
      setError("Realtime Database isn't configured on this build — check lib/firebase.ts exports `rtdb`.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const wsRef = ref(rtdb, `workspaces/${code}`);
      const snap  = await get(wsRef);

      if (!snap.exists()) {
        setError("Invalid or expired code. Please generate a new one from your agent.");
        setLoading(false);
        return;
      }

      const agentData = snap.val();

      if (agentData.status !== "waiting") {
        setError(
          agentData.status === "connected"
            ? "This code has already been used to connect a workspace."
            : "This workspace isn't ready to connect right now."
        );
        setLoading(false);
        return;
      }

      // registeredAt is a raw millisecond timestamp (Date.now() on
      // the agent side) — not an ISO string, so no new Date(...) wrap
      const registeredAt = agentData.registeredAt || 0;
      if (Date.now() - registeredAt > 10 * 60 * 1000) {
        setError("This code has expired. Please restart your agent to get a new code.");
        setLoading(false);
        return;
      }

      await update(wsRef, {
        userId: user.uid,
        status: "connected",
        connectedAt: Date.now(),
      });

      const workspace: WorkspaceData = {
        id: code,          // the code IS the workspace id — same key
        code,               // the rest of the app (workspace/[id]/page.tsx)
        pcName: agentData.pcName || "My PC",  // already routes on this
        os: agentData.os || "Unknown OS",
        status: "online",
        connectedAt: new Date().toISOString(),
      };

      toast.success(`${workspace.pcName} connected! 😈`);
      onConnected(workspace);
      onClose();
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      console.error("Workspace connect error:", fbErr);

      if (fbErr.code === "PERMISSION_DENIED" || fbErr.message?.includes("permission")) {
        setError("Realtime Database rules are blocking this read/write. Check your RTDB security rules allow authenticated users to read/update /workspaces/{code}.");
      } else {
        setError(`Connection failed: ${fbErr.code || fbErr.message || "unknown error"}. Check the browser console (F12) for details.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const code = digits.join("");
  const isComplete = code.length === 10 && digits.every(d => d !== "");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-md z-10">
        <div className="absolute -inset-1 rounded-2xl opacity-20 blur-xl"
          style={{ background: "linear-gradient(135deg, #FF3B30, #CC1A10)" }} aria-hidden />

        <div className="relative rounded-2xl border border-[#FF3B30]/20 overflow-hidden"
          style={{ background: "rgba(8,4,4,0.98)" }}>

          <div className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, #FF3B30, transparent)" }} />

          <div className="px-6 pt-5 pb-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-white font-bold text-base leading-none">Add Workspace</h2>
                <p className="text-gray-500 text-xs mt-0.5">Connect your PC agent</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="px-6 py-6">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/3 border border-white/6 mb-6">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" className="shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-gray-400 text-xs leading-relaxed">
                Open <span className="text-white font-semibold">Vnus Agent</span> on your PC. 
                A 10-digit code will appear on screen. Enter it below to connect.
              </p>
            </div>

            <div className="mb-2">
              <label className="text-gray-400 text-xs font-medium mb-3 block">Enter your 10-digit code</label>
              <div className="flex gap-1.5 justify-center" onPaste={handlePaste}>
                {digits.map((digit, i) => (
                  <>
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInput(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className={`w-9 h-11 text-center text-sm font-bold rounded-lg border transition-all outline-none uppercase
                        ${digit ? "border-[#FF3B30]/60 bg-[#FF3B30]/8 text-white" : "border-white/10 bg-white/4 text-white"}
                        ${error ? "border-red-500/50" : ""}
                        focus:border-[#FF3B30]/80 focus:bg-[#FF3B30]/12`}
                    />
                    {i === 4 && (
                      <div key="dash" className="flex items-center">
                        <span className="text-gray-600 text-lg font-light">–</span>
                      </div>
                    )}
                  </>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-red-500/8 border border-red-500/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <p className="text-red-400 text-xs leading-relaxed">{error}</p>
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={!isComplete || loading}
              className="w-full mt-5 py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              style={{ background: isComplete ? "linear-gradient(135deg, #FF3B30, #CC1A10)" : "rgba(255,59,48,0.2)" }}
            >
              {loading ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>Connecting...</>
              ) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>Connect Workspace</>
              )}
            </button>

            <p className="text-center text-gray-600 text-xs mt-4">
              Don&apos;t have the agent?{" "}
              <button onClick={onClose} className="text-[#FF3B30] hover:underline">Download it first</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}