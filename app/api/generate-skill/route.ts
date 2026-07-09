import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, description, examples, apps, category } = await req.json();

    if (!name || !description) {
      return NextResponse.json({ error: "Name and description required" }, { status: 400 });
    }

    const prompt = `You are a skill generator for Vnus AI — an AI agent platform.

Generate a complete skill configuration based on this user input:

Skill Name: ${name}
Description: ${description}
Example Commands: ${examples.join(", ")}
Apps to use: ${apps.length > 0 ? apps.join(", ") : "Any relevant apps"}
Category: ${category}

Return ONLY a valid JSON object with this exact structure:
{
  "id": "skill-id-lowercase-with-dashes",
  "name": "${name}",
  "description": "Clear one-line description",
  "category": "${category.toLowerCase()}",
  "systemPrompt": "Detailed AI instructions for this skill. Include what it can do, how to do it, what apps to use, and any important rules. Be thorough.",
  "actions": ["action1", "action2", "action3"],
  "examples": ${JSON.stringify(examples.filter((e: string) => e.trim()))},
  "permissions": ["browser"],
  "price": "free"
}

Make the systemPrompt very detailed and specific — it directly controls how the AI agent behaves.
Return only the JSON, no explanation text.`;

    const response = await fetch("https://capi.aerolink.lat/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.AEROLINK_API_KEY || "",
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Aerolink error:", err);
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });
    }

    const skill = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ skill });

  } catch (err) {
    console.error("Generate skill error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}