import { NextRequest, NextResponse } from "next/server";

// ── Local generation fallback ──────────────────────────────
function generateLocally(name: string, description: string, examples: string[], apps: string[], category: string) {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-"),
    name,
    description,
    category: category.toLowerCase(),
    systemPrompt: `You are ${name}, a specialist AI agent running on the user's PC.

Your purpose: ${description}

Apps you will use: ${apps.length > 0 ? apps.join(", ") : "Chrome, system apps"}

What you can help with:
${examples.filter(e => e.trim()).map(e => `- ${e}`).join("\n")}

How to work:
1. Take a screenshot to see the current state of the screen
2. Analyze what needs to be done based on the user command
3. Open the required app if not already open
4. Perform the required actions step by step
5. Take a final screenshot to verify completion
6. Report back clearly what was done

Rules:
- Always screenshot first before acting
- Be precise with coordinates when clicking
- Confirm before any irreversible action (delete, send email, etc)
- Report clearly what you did and the result`,
    actions: ["screenshot", "open_app", "click", "type", "key", "done"],
    examples: examples.filter(e => e.trim()),
    permissions: ["browser", "files", "network"],
    price: "free",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name = "", description = "", examples = [], apps = [], category = "Productivity" } = body;

    if (!name.trim() || !description.trim()) {
      return NextResponse.json({ error: "Name and description required" }, { status: 400 });
    }

    const apiKey = process.env.AEROLINK_API_KEY;

    // No key → generate locally
    if (!apiKey || apiKey.includes("your_key") || apiKey.includes("YOUR_KEY") || apiKey.trim() === "") {
      console.log("No API key — generating locally");
      return NextResponse.json({ skill: generateLocally(name, description, examples, apps, category) });
    }

    const prompt = `Generate a Vnus AI skill configuration JSON.

Skill details:
- Name: ${name}
- Description: ${description}  
- Examples: ${examples.filter((e: string) => e.trim()).join(" | ")}
- Apps: ${apps.length > 0 ? apps.join(", ") : "any"}
- Category: ${category}

Return ONLY valid JSON, no markdown fences, no explanation text:
{"id":"${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}","name":"${name}","description":"${description}","category":"${category.toLowerCase()}","systemPrompt":"Write detailed 200+ word instructions for this AI agent. Include purpose, which apps to use, step by step approach, and important rules.","actions":["screenshot","open_app","click","type","done"],"examples":${JSON.stringify(examples.filter((e: string) => e.trim()))},"permissions":["browser"],"price":"free"}`;

    try {
      // Try with claude-opus-4-8 first (best quality)
      let res = await fetch("https://capi.aerolink.lat/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-opus-4-8",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      // If opus fails try sonnet
      if (!res.ok) {
        console.log("Opus failed, trying sonnet...", res.status);
        res = await fetch("https://capi.aerolink.lat/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 1500,
            messages: [{ role: "user", content: prompt }],
          }),
        });
      }

      // If sonnet also fails try haiku
      if (!res.ok) {
        console.log("Sonnet failed, trying haiku...", res.status);
        res = await fetch("https://capi.aerolink.lat/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1500,
            messages: [{ role: "user", content: prompt }],
          }),
        });
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error("All models failed:", res.status, errText);
        // Fallback to local
        return NextResponse.json({ skill: generateLocally(name, description, examples, apps, category) });
      }

      const data = await res.json();
      const text = (data.content?.[0]?.text || "").trim();

      // Parse JSON
      let skill = null;
      try {
        // Clean text first
        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        skill = JSON.parse(cleaned);
      } catch {
        // Extract JSON block
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          try { skill = JSON.parse(match[0]); } catch { skill = null; }
        }
      }

      if (skill && skill.name && skill.systemPrompt) {
        return NextResponse.json({ skill });
      }

      // JSON parse failed — local fallback
      console.log("JSON parse failed, using local generation");
      return NextResponse.json({ skill: generateLocally(name, description, examples, apps, category) });

    } catch (fetchErr) {
      console.error("Fetch error:", fetchErr);
      return NextResponse.json({ skill: generateLocally(name, description, examples, apps, category) });
    }

  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json({
      skill: {
        id: "custom-skill",
        name: "Custom Skill",
        description: "A custom AI skill",
        category: "productivity",
        systemPrompt: "You are a helpful AI agent. Follow user instructions carefully and take screenshots to verify your actions.",
        actions: ["screenshot", "done"],
        examples: [],
        permissions: ["browser"],
        price: "free",
      }
    });
  }
}