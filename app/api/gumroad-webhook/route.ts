// app/api/gumroad-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database"; // ← RTDB

// ── Product name → plan key ─────────────────────────────
const PLAN_MAP: Record<string, string> = {
  "agentic vnus — free":        "free",
  "agentic vnus — starter":     "starter",
  "agentic vnus — pro":         "pro",
  "agentic vnus — pro max":     "pro_max",
  "agentic vnus — elite":       "elite",
  "agentic vnus — elite ultra": "elite_ultra",
  // fallback
  "free":        "free",
  "starter":     "starter",
  "pro":         "pro",
  "pro max":     "pro_max",
  "elite":       "elite",
  "elite ultra": "elite_ultra",
};

const TASK_LIMITS: Record<string, number> = {
  free: 50, starter: 250, pro: 500,
  pro_max: 1250, elite: 5000, elite_ultra: 10000,
};

function initAdmin() {
  if (getApps().length > 0) return;
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID   || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "",
      privateKey:  (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
    // RTDB needs its own URL — agent listens here, not Firestore
    databaseURL: process.env.FIREBASE_ADMIN_DATABASE_URL || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "",
  });
}

const SELLER_ID = process.env.GUMROAD_SELLER_ID || "aniMvkjvbb9A1rOoWKxjzg==";

export async function POST(req: NextRequest) {
  try {
    initAdmin();
    const db = getFirestore();

    // Gumroad sends application/x-www-form-urlencoded
    let fields: Record<string, string> = {};

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      params.forEach((v, k) => { fields[k] = v; });
    } else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      form.forEach((v, k) => { fields[k] = v.toString(); });
    } else {
      // Try JSON fallback
      try {
        fields = await req.json();
      } catch {
        const text = await req.text();
        new URLSearchParams(text).forEach((v, k) => { fields[k] = v; });
      }
    }

    console.log("📦 Gumroad ping:", JSON.stringify(fields, null, 2));

    // Test ping — 200 de do
    if (fields["test"] === "true" || fields["test"] === "1") {
      console.log("✅ Test ping OK");
      return NextResponse.json({ ok: true, test: true });
    }

    // Seller verify
    if (fields["seller_id"] && fields["seller_id"] !== SELLER_ID) {
      console.error("❌ Wrong seller:", fields["seller_id"]);
      return NextResponse.json({ error: "Invalid seller" }, { status: 401 });
    }

    // Product name → plan
    const productName = (fields["product_name"] || "").toLowerCase().trim();
    const planKey = PLAN_MAP[productName];
    if (!planKey) {
      console.error("❌ Unknown product:", productName);
      return NextResponse.json({ ok: true, warning: "unknown_product" });
    }

    // user_id nikalo — URL params se
    let userId = "";
    try {
      const urlParams = JSON.parse(fields["url_params"] || "{}");
      userId = urlParams["user_id"] || "";
    } catch {}

    if (!userId) {
      userId = fields["url_params[user_id]"] || fields["user_id"] || "";
    }

    // Email fallback
    if (!userId && fields["email"]) {
      try {
        const userRecord = await getAuth().getUserByEmail(fields["email"]);
        userId = userRecord.uid;
        console.log("✅ Found by email:", userId);
      } catch {
        console.warn("⚠️ User not found by email:", fields["email"]);
        return NextResponse.json({ ok: true, warning: "user_not_found" });
      }
    }

    if (!userId) {
      console.warn("⚠️ No user_id found in ping");
      return NextResponse.json({ ok: true, warning: "no_user_id" });
    }

    // Firebase update
    const userRef  = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      console.error("❌ User not in Firestore:", userId);
      return NextResponse.json({ ok: true, warning: "user_not_in_firestore" });
    }

    await userRef.update({
      plan:            planKey,
      planVerified:    true,
      tasksLimit:      TASK_LIMITS[planKey] || 50,
      tasksUsed:       0,
      planActivatedAt: new Date().toISOString(),
      gumroadSaleId:   fields["sale_id"]        || "",
      gumroadEmail:    fields["email"]           || "",
      subscriptionId:  fields["subscription_id"] || "",
    });

    // RTDB update — electron agent listens HERE for plan
    // verification (listenForPlanVerification in main.js reads
    // /users/{userId} from Realtime Database, not Firestore).
    // Wrapped in its own try/catch so a failure here never breaks
    // the Firestore update above or the webhook's 200 response.
    let workspaceIds: string[] = [];
    try {
      const rtdb = getDatabase();
      await rtdb.ref(`users/${userId}`).update({
        plan: planKey,
        planVerified: true,
      });
      console.log(`✅ RTDB plan synced: user=${userId} plan=${planKey}`);

      // ── NEW: mirror plan into every workspace this user has
      // connected, via the reverse index written by
      // AddWorkspaceModal.tsx at /userWorkspaces/{userId}/{code}.
      // This is the path the Electron agent's
      // listenForPlanVerification() actually listens on now
      // (main.js), since the agent has no Firebase Auth session
      // and can never read the auth-protected /users/{userId} node.
      const userWorkspacesSnap = await rtdb.ref(`userWorkspaces/${userId}`).once("value");
      if (userWorkspacesSnap.exists()) {
        workspaceIds = Object.keys(userWorkspacesSnap.val() || {});
        await Promise.all(
          workspaceIds.map(wsId =>
            rtdb.ref(`workspaces/${wsId}`).update({
              plan: planKey,
              planVerified: true,
            })
          )
        );
        console.log(`✅ Mirrored plan to ${workspaceIds.length} workspace(s): ${workspaceIds.join(", ")}`);
      } else {
        console.warn(`⚠️ No userWorkspaces found for ${userId} — agent won't see this plan update until it reconnects`);
      }
    } catch (rtdbErr) {
      console.error("❌ RTDB plan sync failed:", rtdbErr);
    }

    // Agent connections me bhi plan sync karo
    const agentSnap = await db
      .collection("agent_connections")
      .where("userId", "==", userId)
      .get();

    if (!agentSnap.empty) {
      const batch = db.batch();
      agentSnap.docs.forEach(d => batch.update(d.ref, { plan: planKey }));
      await batch.commit();
    }

    console.log(`✅ Plan activated: user=${userId} plan=${planKey}`);
    return NextResponse.json({ ok: true, userId, planKey, workspacesMirrored: workspaceIds.length });

  } catch (err) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ ok: true, error: "internal" });
  }
}

// GET — verify endpoint is live
export async function GET() {
  return NextResponse.json({
    ok:      true,
    message: "Agentic Vnus webhook endpoint is live",
    seller:  process.env.GUMROAD_SELLER_ID || "not_set",
  });
}