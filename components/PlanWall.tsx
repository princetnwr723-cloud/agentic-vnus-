"use client";
// components/PlanWall.tsx
// Payment verify hone ke baad hi plan activate hota hai
// Free plan seedha activate, paid plans Gumroad ke baad
//
// ── FIX: the Electron agent has NO Firebase Auth session — it can
// only read/write open RTDB paths (like /workspaces/{code}), never
// auth-protected paths like /users/{uid}. Previously this component
// only wrote the plan to /users/{uid}, which the agent's
// listenForPlanVerification() could never read, so the model picker
// never appeared. Now the plan is ALSO mirrored to
// /workspaces/{workspaceId}, which is open in RTDB rules and is
// what main.js now actually listens on.

import { useState, useEffect } from "react";
import { db, rtdb } from "@/lib/firebase";          // ← rtdb import
import { doc, onSnapshot } from "firebase/firestore";
import { ref, set, update } from "firebase/database"; // ← added update
import { useAuth } from "@/lib/AuthContext";
import PricingModal from "./PricingModal";

interface PlanWallProps {
  currentPlan:  string;
  workspaceId:  string;
  pcName:       string;
  onPlanChosen: (planKey: string) => void;
}

export default function PlanWall({
  currentPlan,
  workspaceId,
  pcName,
  onPlanChosen,
}: PlanWallProps) {
  const { user }                          = useAuth();
  const [modalOpen,    setModalOpen]      = useState(true);
  const [waitingPay,   setWaitingPay]     = useState(false);
  const [chosenPlan,   setChosenPlan]     = useState<string | null>(null);

  // Firebase me plan verify hone ka wait karo
  useEffect(() => {
    if (!waitingPay || !user || !chosenPlan) return;

    // Poll Firebase — jab planVerified=true aaye tab activate karo
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (!snap.exists()) return;
      const data         = snap.data();
      const plan         = data?.plan;
      const planVerified = data?.planVerified;

      if (plan === chosenPlan && planVerified === true) {
        unsub();
        setWaitingPay(false);
        // Mark done in localStorage
        localStorage.setItem(`plan_wall_done_${workspaceId}`, "true");
        onPlanChosen(plan);
      }
    });

    return () => unsub();
  }, [waitingPay, user, chosenPlan, workspaceId, onPlanChosen]);

  // ── CHANGED: free plan now writes to BOTH /users/{uid} (for the
  // website's own Firestore-mirrored state / future features) AND
  // /workspaces/{workspaceId} (which is what the Electron agent's
  // listenForPlanVerification() actually listens on — see main.js).
  // Paid plan branch unchanged — Gumroad webhook now mirrors into
  // /workspaces/{code} too, see gumroad-webhook/route.ts.
  const handleContinue = async (planKey: string) => {
    if (planKey === "free") {
      // Free plan — seedha activate, no payment needed
      if (user) {
        try {
          await set(ref(rtdb, `users/${user.uid}`), {
            plan: "free",
            planVerified: true,
          });
        } catch (err) {
          console.error("❌ RTDB free plan sync (/users) failed:", err);
        }

        // ── NEW: mirror into the workspace node the agent can read ──
        try {
          await update(ref(rtdb, `workspaces/${workspaceId}`), {
            plan: "free",
            planVerified: true,
          });
        } catch (err) {
          console.error("❌ RTDB free plan sync (/workspaces) failed:", err);
        }
      }
      setModalOpen(false);
      localStorage.setItem(`plan_wall_done_${workspaceId}`, "true");
      onPlanChosen("free");
      return;
    }

    // Paid plan — Gumroad checkout khulega PricingModal se
    // Hum sirf Firebase me verify hone ka wait karenge
    setChosenPlan(planKey);
    setModalOpen(false);
    setWaitingPay(true);
  };

  // Waiting for payment screen
  if (waitingPay) {
    return (
      <div style={{
        position:       "fixed",
        inset:          0,
        zIndex:         200,
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        background:     "rgba(5,5,5,0.96)",
        backdropFilter: "blur(10px)",
        padding:        "24px",
      }}>
        <div style={{
          width:        "100%",
          maxWidth:     400,
          textAlign:    "center",
          padding:      "32px 24px",
          borderRadius: 20,
          border:       "1px solid rgba(255,59,48,0.2)",
          background:   "rgba(8,4,4,0.98)",
        }}>
          {/* Spinner */}
          <div style={{
            width:        48,
            height:       48,
            borderRadius: "50%",
            border:       "3px solid rgba(255,59,48,0.15)",
            borderTop:    "3px solid #FF3B30",
            margin:       "0 auto 20px",
            animation:    "spin 1s linear infinite",
          }} />

          <p style={{ color:"#fff", fontWeight:800, fontSize:18, margin:"0 0 8px" }}>
            Completing Payment...
          </p>
          <p style={{ color:"#555", fontSize:13, lineHeight:1.6, margin:"0 0 20px" }}>
            Complete your payment in the browser window.
            This will update automatically once payment is confirmed.
          </p>

          <div style={{
            padding:      "12px 16px",
            borderRadius: 10,
            background:   "rgba(96,165,250,0.06)",
            border:       "1px solid rgba(96,165,250,0.2)",
            marginBottom: 20,
          }}>
            <p style={{ color:"#60a5fa", fontSize:12, margin:0 }}>
              ⏳ Waiting for payment confirmation...
            </p>
          </div>

          <button
            onClick={() => { setWaitingPay(false); setModalOpen(true); }}
            style={{
              width:        "100%",
              padding:      "10px 0",
              borderRadius: 10,
              border:       "1px solid rgba(255,255,255,0.1)",
              background:   "rgba(255,255,255,0.04)",
              color:        "#666",
              fontSize:     12,
              cursor:       "pointer",
            }}
          >
            Back to Plans
          </button>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {/* Background overlay */}
      {!modalOpen && (
        <div style={{
          position:       "fixed",
          inset:          0,
          zIndex:         200,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          background:     "rgba(5,5,5,0.95)",
          backdropFilter: "blur(8px)",
        }}>
          <div style={{ textAlign:"center", padding:"0 20px" }}>
            <div style={{
              display:      "inline-flex",
              alignItems:   "center",
              gap:          8,
              padding:      "6px 14px",
              borderRadius: 20,
              marginBottom: 14,
              background:   "rgba(74,222,128,0.08)",
              border:       "1px solid rgba(74,222,128,0.2)",
            }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 6px #4ade80" }} />
              <span style={{ color:"#4ade80", fontSize:12, fontWeight:700 }}>{pcName} connected</span>
            </div>
            <h2 style={{ color:"#fff", fontSize:20, fontWeight:900, margin:"0 0 6px" }}>
              Choose a plan to start
            </h2>
            <p style={{ color:"#555", fontSize:13, margin:"0 0 20px" }}>
              Your agent is ready — pick a plan to unlock it
            </p>
            <button
              onClick={() => setModalOpen(true)}
              style={{
                padding:      "12px 28px",
                borderRadius: 12,
                border:       "none",
                cursor:       "pointer",
                fontSize:     14,
                fontWeight:   700,
                color:        "#fff",
                background:   "linear-gradient(135deg,#FF3B30,#CC1A10)",
              }}
            >
              View Plans →
            </button>
          </div>
        </div>
      )}

      <PricingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentPlan={currentPlan}
        showContinue={true}
        onPlanChosen={handleContinue}
      />
    </>
  );
}