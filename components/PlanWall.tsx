"use client";
// PlanWall — workspace/[id]/page.tsx me use hoga
// Jab user pehli baar connect kare ya plan "free" ho aur upgrade karna ho
// showContinue=true ke saath PricingModal dikhata hai

import { useState } from "react";
import PricingModal from "./PricingModal";

interface PlanWallProps {
  currentPlan:   string;
  workspaceId:   string;
  pcName:        string;
  onPlanChosen:  (planKey: string) => void;
}

export default function PlanWall({
  currentPlan,
  workspaceId,
  pcName,
  onPlanChosen,
}: PlanWallProps) {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <>
      {/* Background — blurred workspace behind */}
      <div style={{
        position:       "fixed",
        inset:          0,
        zIndex:         200,
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        background:     "rgba(5,5,5,0.92)",
        backdropFilter: "blur(8px)",
        padding:        "20px",
      }}>

        {/* Top info */}
        <div style={{ textAlign:"center", marginBottom:24, zIndex:1 }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"6px 14px", borderRadius:20, marginBottom:12,
            background:"rgba(255,59,48,0.08)",
            border:"1px solid rgba(255,59,48,0.2)",
          }}>
            <div style={{
              width:7, height:7, borderRadius:"50%",
              background:"#4ade80",
              boxShadow:"0 0 6px #4ade80",
            }} />
            <span style={{ color:"#4ade80", fontSize:12, fontWeight:700 }}>
              {pcName} connected
            </span>
          </div>

          <h2 style={{
            color:"#fff", fontSize:22, fontWeight:900,
            margin:"0 0 6px", lineHeight:1.2,
          }}>
            Choose your plan to start
          </h2>
          <p style={{ color:"#555", fontSize:13, margin:0 }}>
            Your agent is ready — pick a plan to unlock it
          </p>
        </div>

        {/* Open modal button agar modal close ho jaaye */}
        {!modalOpen && (
          <button
            onClick={() => setModalOpen(true)}
            style={{
              padding:"12px 28px", borderRadius:14, border:"none",
              cursor:"pointer", fontSize:14, fontWeight:700, color:"#fff",
              background:"linear-gradient(135deg,#FF3B30,#CC1A10)",
              boxShadow:"0 4px 20px rgba(255,59,48,0.3)",
            }}
          >
            View Plans →
          </button>
        )}
      </div>

      {/* Pricing Modal — showContinue=true */}
      <PricingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentPlan={currentPlan}
        showContinue={true}
        onPlanChosen={(planKey) => {
          setModalOpen(false);
          onPlanChosen(planKey);
        }}
      />
    </>
  );
}
