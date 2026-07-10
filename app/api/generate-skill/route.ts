import { NextRequest, NextResponse } from "next/server";

// ── Always generate skill locally — no API needed ──────────
function generateSkillLocally(
  name: string,
  description: string,
  examples: string[],
  apps: string[],
  category: string
) {
  const cleanExamples = examples.filter((e: string) => e.trim());
  const appsText = apps.length > 0 ? apps.join(", ") : "Chrome, system apps";

  return {
    id: name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-"),
    name,
    description,
    category: category.toLowerCase(),
    systemPrompt: `You are ${name}, a specialist AI agent.

Your purpose: ${description}

Apps you will use: ${appsText}

What you can do:
${cleanExamples.map((e: string) => `- ${e}`).join("\n")}

Step-by-step approach:
1. Take a screenshot to see the current state of the screen
2. Identify what needs to be done based on the user's command
3. Open the relevant app if not already open (${appsText})
4. Perform the required actions precisely
5. Verify the action was completed successfully
6. Report back to the user with what was done

Important rules:
- Always take a screenshot first before acting
- Be precise with clicks and typing
- Confirm with the user before any irreversible action (like deleting files or sending emails)
- If something goes wrong, take another screenshot and retry
- Report clearly what you did and the result`,
    actions: ["screenshot", "open_app", "click", "type", "done"],
    examples: cleanExamples,
    permissions: ["browser", "files", "network"],
    price: "free",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name = "",
      description = "",
      examples = [],
      apps = [],
      category = "Productivity",
    } = body;

    if (!name.trim() || !description.trim()) {
      return NextResponse.json(
        { error: "Name and description required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.AEROLINK_API_KEY;

    // No API key — generate locally (always works!)
    if (!apiKey || apiKey.includes("your_key") || apiKey.includes("YOUR_KEY")) {
      const skill = generateSkillLocally(name, description, examples, apps, category);
      return NextResponse.json({ skill });
    }

    // Try Aerolink API
    try {
      const prompt = `Generate a Vnus AI skill configuration as a JSON object.

Input:
- Name: ${name}
- Description: ${description}
- Examples: ${examples.filter((e: string) => e.trim()).join(", ")}
- Apps: ${apps.length > 0 ? apps.join(", ") : "any relevant"}
- Category: ${category}

Return ONLY this JSON (no markdown, no backticks, no explanation):
{"id":"${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}","name":"${name}","description":"${description}","category":"${category.toLowerCase()}","systemPrompt":"[Write 150+ word detailed instructions for this AI agent including what it does, which apps to use, step by step approach, and rules]","actions":["screenshot","open_app","click","type","done"],"examples":${JSON.stringify(examples.filter((e: string) => e.trim()))},"permissions":["browser"],"price":"free"}`;

      const res = await fetch("https://capi.aerolink.lat/v1/messages", {
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

      if (res.ok) {
        const data = await res.json();
        const text = data.content?.[0]?.text?.trim() || "";

        // Try parsing JSON
        let skill = null;
        try { skill = JSON.parse(text); } catch {
          const m = text.match(/\{[\s\S]*\}/);
          if (m) { try { skill = JSON.parse(m[0]); } catch { skill = null; } }
        }

        if (skill && skill.name && skill.systemPrompt) {
          return NextResponse.json({ skill });
        }
      }

      // API failed — fallback to local generation
      const skill = generateSkillLocally(name, description, examples, apps, category);
      return NextResponse.json({ skill });

    } catch {
      // Any error — fallback to local generation
      const skill = generateSkillLocally(name, description, examples, apps, category);
      return NextResponse.json({ skill });
    }

  } catch (err) {
    console.error("Route error:", err);
    // Even on route error — return a basic skill
    return NextResponse.json({
      skill: {
        id: "custom-skill",
        name: "Custom Skill",
        description: "A custom skill",
        category: "productivity",
        systemPrompt: "You are a helpful AI agent. Follow the user's instructions carefully.",
        actions: ["screenshot", "done"],
        examples: [],
        permissions: ["browser"],
        price: "free",
      }
    });
  }
}