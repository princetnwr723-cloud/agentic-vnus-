"use client";
// components/PermissionBanner.tsx
// Jab agent koi dangerous kaam karna chahe — ye popup aata hai
// User approve ya deny karta hai — agent tab tak wait karta hai

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection, onSnapshot, doc, updateDoc, query, where, orderBy,
} from "firebase/firestore";

interface Permission {
  id:          string;
  type:        string;
  description: string;
  command:     string;
  filePath:    string;
  riskLevel:   "high" | "medium" | "low";
  status:      "pending" | "approved" | "denied";
  icon:        string;
  createdAt:   string;
}

interface PermissionBannerProps {
  workspaceId: string;
}

const RISK_COLORS = {
  high:   { bg: "rgba(255,59,48,0.1)",  border: "rgba(255,59,48,0.4)",  text: "#FF3B30", label: "High Risk"   },
  medium: { bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.4)", text: "#fbbf24", label: "Medium Risk" },
  low:    { bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.4)", text: "#4ade80", label: "Low Risk"    },
};

export default function PermissionBanner({ workspaceId }: PermissionBannerProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading,     setLoading]     = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) return;

    // Listen for pending permissions
    const q = query(
      collection(db, "agent_connections", workspaceId, "permissions"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setPermissions(snap.docs.map(d => ({
        id:          d.id,
        type:        d.data().type        || "",
        description: d.data().description || "",
        command:     d.data().command     || "",
        filePath:    d.data().filePath    || "",
        riskLevel:   d.data().riskLevel   || "medium",
        status:      d.data().status      || "pending",
        icon:        d.data().icon        || "⚡",
        createdAt:   d.data().createdAt   || "",
      })));
    });

    return () => unsub();
  }, [workspaceId]);

  const handleDecision = async (permId: string, decision: "approved" | "denied") => {
    setLoading(permId);
    try {
      await updateDoc(
        doc(db, "agent_connections", workspaceId, "permissions", permId),
        { status: decision, decidedAt: new Date().toISOString() }
      );
      setPermissions(prev => prev.filter(p => p.id !== permId));
    } catch (err) {
      console.error("Permission update error:", err);
    } finally {
      setLoading(null);
    }
  };

  if (permissions.length === 0) return null;

  return (
    <div style={{
      position:       "fixed",
      top:            56,
      left:           0,
      right:          0,
      zIndex:         500,
      display:        "flex",
      flexDirection:  "column",
      gap:            8,
      padding:        "10px 16px",
      pointerEvents:  "none",
    }}>
      {permissions.map((perm) => {
        const risk    = RISK_COLORS[perm.riskLevel] || RISK_COLORS.medium;
        const isLoading = loading === perm.id;

        return (
          <div
            key={perm.id}
            style={{
              background:     risk.bg,
              border:         `1px solid ${risk.border}`,
              borderLeft:     `3px solid ${risk.text}`,
              borderRadius:   12,
              padding:        "12px 16px",
              display:        "flex",
              alignItems:     "center",
              gap:            14,
              backdropFilter: "blur(20px)",
              boxShadow:      "0 4px 24px rgba(0,0,0,0.5)",
              pointerEvents:  "all",
              animation:      "slideDown 0.3s ease",
            }}
          >
            {/* Icon */}
            <div style={{
              width:          38,
              height:         38,
              borderRadius:   10,
              background:     risk.bg,
              border:         `1px solid ${risk.border}`,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              fontSize:       18,
              flexShrink:     0,
            }}>
              {perm.icon}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{
                  fontSize:      10,
                  fontWeight:    700,
                  color:         risk.text,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding:       "1px 7px",
                  borderRadius:  20,
                  background:    risk.bg,
                  border:        `1px solid ${risk.border}`,
                }}>
                  {risk.label}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                  Permission Required
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#ccc", margin: 0, lineHeight: 1.5 }}>
                {perm.description}
              </p>
              {perm.command && (
                <code style={{
                  fontSize:   11,
                  color:      "#888",
                  background: "rgba(255,255,255,0.06)",
                  padding:    "2px 8px",
                  borderRadius: 4,
                  marginTop:  4,
                  display:    "inline-block",
                  maxWidth:   "100%",
                  overflow:   "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {perm.command.slice(0, 80)}{perm.command.length > 80 ? "..." : ""}
                </code>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => handleDecision(perm.id, "denied")}
                disabled={isLoading}
                style={{
                  padding:      "7px 14px",
                  borderRadius: 8,
                  border:       "1px solid rgba(255,255,255,0.12)",
                  background:   "rgba(255,255,255,0.06)",
                  color:        "#888",
                  fontSize:     12,
                  fontWeight:   600,
                  cursor:       isLoading ? "not-allowed" : "pointer",
                  transition:   "all 0.2s",
                  opacity:      isLoading ? 0.5 : 1,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,59,48,0.15)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              >
                Deny
              </button>
              <button
                onClick={() => handleDecision(perm.id, "approved")}
                disabled={isLoading}
                style={{
                  padding:      "7px 16px",
                  borderRadius: 8,
                  border:       "none",
                  background:   `linear-gradient(135deg, ${risk.text}, ${risk.text}cc)`,
                  color:        "#fff",
                  fontSize:     12,
                  fontWeight:   700,
                  cursor:       isLoading ? "not-allowed" : "pointer",
                  transition:   "all 0.2s",
                  opacity:      isLoading ? 0.5 : 1,
                  display:      "flex",
                  alignItems:   "center",
                  gap:          5,
                }}
              >
                {isLoading ? (
                  <svg style={{ animation: "spin 1s linear infinite" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
                Approve
              </button>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
