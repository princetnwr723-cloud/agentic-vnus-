// app/api/disconnect-workspace/route.ts
import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function initAdmin() {
  if (getApps().length > 0) return;
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID   || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "",
      privateKey:  (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    initAdmin();
    const db = getFirestore();

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workspaceId } = await req.json() as { workspaceId: string };
    if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

    // Token verify
    let uid = "";
    try {
      const decoded = await getAuth().verifyIdToken(token);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const wsRef  = db.collection("agent_connections").doc(workspaceId);
    const wsSnap = await wsRef.get();

    if (!wsSnap.exists) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Ownership check
    if (wsSnap.data()?.userId !== uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Properly disconnect ────────────────────────────────
    // userId null karo taaki dashboard query me na aaye
    await wsRef.update({
      status:           "disconnected",
      userDisconnected: true,
      userId:           null,          // ← ye fix hai — reload pe wapas nahi aayega
      disconnectedAt:   new Date().toISOString(),
    });

    console.log(`✅ Workspace disconnected: ${workspaceId}`);
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("Disconnect error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}