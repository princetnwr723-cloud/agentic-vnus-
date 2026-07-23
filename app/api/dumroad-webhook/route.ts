// app/api/gumroad-webhook/route.ts
// Gumroad Ping aata hai jab koi plan purchase kare
// url_params me user_id hoga jo checkout URL se aaya tha
// Firebase me us user ka plan update ho jaata hai

import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ── Gumroad product name → plan key mapping ───────────────
const PRODUCT_PLAN_MAP: Record<string, string> = {
  "vnus agent — free":        "free",
  "vnus agent — starter":     "starter",
  "vnus agent — pro":         "pro",
  "vnus agent — pro max":     "pro_max",
  "vnus agent — elite":       "elite",
  "vnus agent — elite ultra": "elite_ultra",
  // fallback short names bhi handle karo
  "free":        "free",
  "starter":     "starter",
  "pro":         "pro",
  "pro max":     "pro_max",
  "elite":       "elite",
  "elite ultra": "elite_ultra",
};

// ── Plan ke hisaab se task limit ─────────────────────────
const PLAN_TASK_LIMITS: Record<string, number> = {
  free:        50,
  starter:     250,
  pro:         500,
  pro_max:     1250,
  elite:       5000,
  elite_ultra: 10000,
};

// ── Firebase Admin init ───────────────────────────────────
function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID   || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "",
        privateKey:  (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      }),
    });
  }
  return getFirestore();
}

// ── Gumroad Seller ID verify karo ────────────────────────
const GUMROAD_SELLER_ID = process.env.GUMROAD_SELLER_ID || "aniMvkjvbb9A1rOoWKxjzg==";

export async function POST(req: NextRequest) {
  try {
    // Gumroad x-www-form-urlencoded bhejta hai
    const formData  = await req.formData();
    const fields: Record<string, string> = {};
    formData.forEach((value, key) => {
      fields[key] = value.toString();
    });

    console.log("📦 Gumroad ping received:", JSON.stringify(fields, null, 2));

    // ── Seller verify ─────────────────────────────────────
    const sellerId = fields["seller_id"];
    if (sellerId && sellerId !== GUMROAD_SELLER_ID) {
      console.error("❌ Invalid seller_id:", sellerId);
      return NextResponse.json({ error: "Invalid seller" }, { status: 401 });
    }

    // ── Test ping ignore karo ─────────────────────────────
    if (fields["test"] === "true") {
      console.log("✅ Test ping received — ignoring");
      return NextResponse.json({ ok: true, test: true });
    }

    // ── Product name se plan key nikalo ──────────────────
    const productName = (fields["product_name"] || "").toLowerCase().trim();
    const planKey     = PRODUCT_PLAN_MAP[productName];

    if (!planKey) {
      console.error("❌ Unknown product:", productName);
      return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    }

    // ── url_params se user_id nikalo ─────────────────────
    // Gumroad url_params JSON string ya nested form fields bhejta hai
    let userId = "";

    // Method 1: url_params as JSON string
    try {
      const urlParams = JSON.parse(fields["url_params"] || "{}");
      userId = urlParams["user_id"] || "";
    } catch {
      // Method 2: direct field
      userId = fields["url_params[user_id]"] || fields["user_id"] || "";
    }

    if (!userId) {
      // Email se dhundho fallback ke taur par
      const email = fields["email"] || "";
      console.warn("⚠️ No user_id in ping, email:", email);

      // Email se Firebase user dhundho
      if (email) {
        try {
          const { getAuth } = await import("firebase-admin/auth");
          const userRecord = await getAuth().getUserByEmail(email);
          userId = userRecord.uid;
          console.log("✅ Found user by email:", userId);
        } catch {
          console.error("❌ Could not find user by email:", email);
          // Still return 200 so Gumroad doesn't retry
          return NextResponse.json({ ok: true, warning: "user_not_found" });
        }
      } else {
        return NextResponse.json({ ok: true, warning: "no_user_id" });
      }
    }

    // ── Firebase me plan update karo ─────────────────────
    const db          = getAdminDb();
    const userRef     = db.collection("users").doc(userId);
    const userSnap    = await userRef.get();

    if (!userSnap.exists) {
      console.error("❌ User not found in Firestore:", userId);
      return NextResponse.json({ ok: true, warning: "user_not_in_firestore" });
    }

    const taskLimit = PLAN_TASK_LIMITS[planKey] || 50;

    await userRef.update({
      plan:              planKey,
      planActivatedAt:   new Date().toISOString(),
      tasksLimit:        taskLimit,
      tasksUsed:         0, // reset on new plan
      gumroadSaleId:     fields["sale_id"]        || "",
      gumroadOrderNum:   fields["order_number"]   || "",
      gumroadEmail:      fields["email"]           || "",
      subscriptionId:    fields["subscription_id"] || "",
    });

    // ── Agent connections me bhi plan update karo ────────
    // Taaki Electron app ko bhi pata chale
    const agentSnap = await db
      .collection("agent_connections")
      .where("userId", "==", userId)
      .get();

    const batch = db.batch();
    agentSnap.docs.forEach((doc) => {
      batch.update(doc.ref, { plan: planKey });
    });
    await batch.commit();

    console.log(`✅ Plan updated: user=${userId} plan=${planKey}`);

    return NextResponse.json({
      ok:      true,
      userId,
      planKey,
      message: `Plan ${planKey} activated`,
    });

  } catch (err) {
    console.error("❌ Webhook error:", err);
    // 200 return karo taaki Gumroad retry na kare
    return NextResponse.json({ ok: true, error: "internal" }, { status: 200 });
  }
}

// GET — test ke liye
export async function GET() {
  return NextResponse.json({
    ok:      true,
    message: "Gumroad webhook endpoint is live",
    seller:  GUMROAD_SELLER_ID,
  });
}