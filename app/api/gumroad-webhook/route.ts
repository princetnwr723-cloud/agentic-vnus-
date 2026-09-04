// app/api/gumroad-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const PLAN_MAP: Record<string, string> = {
  "agentic vnus — free":        "free",
  "agentic vnus — starter":     "starter",
  "agentic vnus — pro":         "pro",
  "agentic vnus — pro max":     "pro_max",
  "agentic vnus — elite":       "elite",
  "agentic vnus — elite ultra": "elite_ultra",
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
  });
}

const SELLER_ID = process.env.GUMROAD_SELLER_ID || "aniMvkjvbb9A1rOoWKxjzg==";

export async function POST(req: NextRequest) {
  try {
    initAdmin();
    const db = getFirestore();

    let fields: Record<string, string> = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      new URLSearchParams(text).forEach((v, k) => { fields[k] = v; });
    } else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      form.forEach((v, k) => { fields[k] = v.toString(); });
    } else {
      try {
        fields = await req.json();
      } catch {
        const text = await req.text();
        new URLSearchParams(text).forEach((v, k) => { fields[k] = v; });
      }
    }

    console.log("📦 Gumroad ping:", JSON.stringify(fields, null, 2));

    if (fields["test"] === "true" || fields["test"] === "1") {
      return NextResponse.json({ ok: true, test: true });
    }

    if (fields["seller_id"] && fields["seller_id"] !== SELLER_ID) {
      return NextResponse.json({ error: "Invalid seller" }, { status: 401 });
    }

    const productName = (fields["product_name"] || "").toLowerCase().trim();
    const planKey = PLAN_MAP[productName];
    if (!planKey) {
      return NextResponse.json({ ok: true, warning: "unknown_product" });
    }

    let userId = "";
    try {
      const urlParams = JSON.parse(fields["url_params"] || "{}");
      userId = urlParams["user_id"] || "";
    } catch {}
    if (!userId) userId = fields["url_params[user_id]"] || fields["user_id"] || "";

    if (!userId && fields["email"]) {
      try {
        const userRecord = await getAuth().getUserByEmail(fields["email"]);
        userId = userRecord.uid;
      } catch {
        return NextResponse.json({ ok: true, warning: "user_not_found" });
      }
    }

    if (!userId) return NextResponse.json({ ok: true, warning: "no_user_id" });

    const userRef  = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
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

    // ── NEW: mirror plan into every agent_workspaces doc owned by
    // this user. Firestore supports a direct equality query here —
    // no reverse index needed (unlike RTDB, which required manual
    // /userWorkspaces bookkeeping to avoid a full collection scan).
    let workspacesMirrored = 0;
    try {
      const wsSnap = await db.collection("agent_workspaces").where("userId", "==", userId).get();
      if (!wsSnap.empty) {
        const batch = db.batch();
        wsSnap.docs.forEach(d => batch.update(d.ref, { plan: planKey, planVerified: true }));
        await batch.commit();
        workspacesMirrored = wsSnap.size;
        console.log(`✅ Mirrored plan to ${workspacesMirrored} agent_workspaces doc(s)`);
      } else {
        console.warn(`⚠️ No agent_workspaces found for userId=${userId} — agent won't see this until it reconnects`);
      }
    } catch (err) {
      console.error("❌ agent_workspaces plan mirror failed:", err);
    }

    console.log(`✅ Plan activated: user=${userId} plan=${planKey}`);
    return NextResponse.json({ ok: true, userId, planKey, workspacesMirrored });

  } catch (err) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ ok: true, error: "internal" });
  }
}

export async function GET() {
  return NextResponse.json({
    ok:      true,
    message: "Agentic Vnus webhook endpoint is live",
    seller:  process.env.GUMROAD_SELLER_ID || "not_set",
  });
}