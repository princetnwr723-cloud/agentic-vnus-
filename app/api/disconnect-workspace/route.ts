// app/api/disconnect-workspace/route.ts
// Called when user clicks Disconnect in dashboard
// Sets userDisconnected: true in Firestore so agent respects it

import { NextRequest, NextResponse } from "next/server";
import { db, adminAuth }             from "@/lib/firebase";

export async function POST(req: NextRequest) {
  try {
    // Verify Firebase auth token
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let uid: string;
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { workspaceId } = await req.json() as { workspaceId: string };
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }

    // Verify workspace belongs to this user
    const wsDoc = await db.collection("agent_connections").doc(workspaceId).get();
    if (!wsDoc.exists) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const wsData = wsDoc.data()!;
    if (wsData.userId !== uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Set disconnect flags — agent will see this on next poll
    await db.collection("agent_connections").doc(workspaceId).update({
      status:           "disconnected",
      userDisconnected: true,
      userId:           null,
      disconnectedAt:   new Date().toISOString(),
    });

    console.log(`✅ Workspace ${workspaceId} disconnected by user ${uid}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Disconnect error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
