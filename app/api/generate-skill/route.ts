import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, examples = [], apps = [], category = "Productivity" } = body;

    if (!name?.trim() || !description?.trim()) {
      return NextResponse.json({ error: "Name and description required" }, { status: 400 });
    }

    const apiKey = process.env.AEROLINK_API_KEY;

    // If no API key — return a mock skill for testing
    if (!apiKey || apiKey === "aero_live_your_key_here") {
      const mockSkill = {
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        description,
        category: category.toLowerCase(),
        systemPrompt: `You are a ${name} specialist agent.\n\n${description}\n\nYou can help users with:\n${examples.filter((e: string) => e.trim()).map((e: string) => `- ${e}`).join("\n")}\n\nAlways be precise and confirm before taking any irreversible action.`,
        actions: ["execute", "screenshot", "done"],
        examples: examples.filter((e: string) => e.trim()),
        permissions: apps.length > 0 ? ["browser"] : ["browser"],
        price: "free",
      };
      return NextResponse.json({ skill: mockSkill });
    }

    const prompt = `You are a skill generator for Vnus AI — an AI agent platform.

Generate a complete skill configuration based on this user input:

Skill Name: ${name}
Description: ${description}
Example Commands: ${examples.filter((e: string) => e.trim()).join(", ")}
Apps to use: ${apps.length > 0 ? apps.join(", ") : "Any relevant apps"}
Category: ${category}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "id": "${name.toLowerCase().replace(/\s+/g, "-")}",
  "name": "${name}",
  "description": "${description}",
  "category": "${category.toLowerCase()}",
  "systemPrompt": "Write very detailed AI instructions here. Include what this skill specializes in, step by step how to do each task, which apps to open, what to click, and important rules to follow. Minimum 200 words.",
  "actions": ["action1", "action2", "action3"],
  "examples": ${JSON.stringify(examples.filter((e: string) => e.trim()))},
  "permissions": ["browser"],
  "price": "free"
}`;

    const response = await fetch("https://capi.aerolink.lat/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Aerolink API error:", response.status, errText);

      // Fallback — generate basic skill locally
      const fallbackSkill = {
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        description,
        category: category.toLowerCase(),
        systemPrompt: `You are a ${name} specialist agent.\n\n${description}\n\nHelp users with:\n${examples.filter((e: string) => e.trim()).map((e: string) => `- ${e}`).join("\n")}\n\nBe precise and confirm before irreversible actions.`,
        actions: ["execute", "screenshot", "done"],
        examples: examples.filter((e: string) => e.trim()),
        permissions: ["browser"],
        price: "free",
      };
      return NextResponse.json({ skill: fallbackSkill });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    // Parse JSON — try multiple patterns
    let skill = null;

    // Try direct JSON parse first
    try {
      skill = JSON.parse(text);
    } catch {
      // Try extracting JSON from text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          skill = JSON.parse(jsonMatch[0]);
        } catch {
          skill = null;
        }
      }
    }

    // If parsing failed — use fallback
    if (!skill) {
      skill = {
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        description,
        category: category.toLowerCase(),
        systemPrompt: `You are a ${name} specialist.\n\n${description}\n\nExamples:\n${examples.filter((e: string) => e.trim()).map((e: string) => `- ${e}`).join("\n")}`,
        actions: ["execute", "screenshot", "done"],
        examples: examples.filter((e: string) => e.trim()),
        permissions: ["browser"],
        price: "free",
      };
    }

    return NextResponse.json({ skill });

  } catch (err) {
    console.error("Generate skill error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}