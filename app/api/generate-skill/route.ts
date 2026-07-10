import { NextRequest, NextResponse } from "next/server";

// ── Always generate skill locally — fallback function ──────────
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
    systemPrompt: `You are ${name}, a specialist AI agent.\n\nYour purpose: ${description}\n\nApps you will use: ${appsText}\n\nWhat you can do:\n${cleanExamples.map((e: string) => `- ${e}`).join("\n")}\n\nStep-by-step approach:\n1. Take a screenshot to see the current state of the screen\n2. Identify what needs to be done based on the user's command\n3. Open the relevant app if not already open (${appsText})\n4. Perform the required actions precisely\n5. Verify the action was completed successfully\n6. Report back to the user with what was done\n\nImportant rules:\n- Always take a screenshot first before acting\n- Be precise with clicks and typing\n- Confirm with the user before any irreversible action (like deleting files or sending emails)\n- If something goes wrong, take another screenshot and retry\n- Report clearly what you did and the result`,
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

    // Check if API key exists
    if (!apiKey || apiKey.includes("your_key") || apiKey.includes("YOUR_KEY")) {
      console.log("No valid API Key found. Using local generation.");
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

Return ONLY valid JSON format. Do not include markdown formatting or backticks. Structure:
{"id":"${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}","name":"${name}","description":"${description}","category":"${category.toLowerCase()}","systemPrompt":"[Write 150+ word detailed instructions for this AI agent including what it does, which apps to use, step by step approach, and rules]","actions":["screenshot","open_app","click","type","done"],"examples":${JSON.stringify(examples.filter((e: string) => e.trim()))},"permissions":["browser"],"price":"free"}`;

      console.log("Sending request to Aerolink API...");
      
      const res = await fetch("https://capi.aerolink.lat/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307", // <-- FIXED MODEL NAME
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.content?.[0]?.text?.trim() || "";
        
        console.log("Received AI Response successfully.");

        let skill = null;
        try { 
          skill = JSON.parse(text); 
        } catch (jsonError) {
          console.warn("Direct JSON parse failed, trying Regex extract...");
          const m = text.match(/\{[\s\S]*\}/);
          if (m) { 
            try { 
              skill = JSON.parse(m[0]); 
            } catch { 
              console.error("Regex JSON parse failed.");
              skill = null; 
            } 
          }
        }

        if (skill && skill.name && skill.systemPrompt) {
          return NextResponse.json({ skill });
        } else {
          console.error("AI returned incomplete JSON structure:", skill);
        }
      } else {
        // Log the exact error from API if it fails
        const errorText = await res.text();
        console.error(`Aerolink API Failed with status ${res.status}:`, errorText);
      }

      // API failed or JSON parsing failed — fallback to local generation
      console.log("Falling back to local skill generation due to API failure.");
      const skill = generateSkillLocally(name, description, examples, apps, category);
      return NextResponse.json({ skill });

    } catch (apiError) {
      console.error("Fetch API Crash Error:", apiError);
      const skill = generateSkillLocally(name, description, examples, apps, category);
      return NextResponse.json({ skill });
    }

  } catch (err) {
    console.error("Global Route error:", err);
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
