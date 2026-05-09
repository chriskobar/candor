import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import {
  AUDIT_SYSTEM_PROMPT,
  DEEP_AUDIT_SYSTEM_PROMPT,
  buildAuditPrompt,
} from "@/lib/auditPrompt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mediaType, context, primaryIntent, deepCritique, userApiKey } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Validate user-supplied key format
    if (userApiKey && !userApiKey.startsWith("sk-ant-")) {
      return NextResponse.json({ error: "Invalid API key format." }, { status: 400 });
    }

    const apiKey = userApiKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "No API key provided." }, { status: 401 });
    }

    // Client instantiated per-request so it picks up the correct key
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: deepCritique ? 16000 : 8000,
      system: deepCritique ? DEEP_AUDIT_SYSTEM_PROMPT : AUDIT_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/png",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: buildAuditPrompt(context, primaryIntent, deepCritique),
            },
          ],
        },
      ],
    });

    const raw = response.content[0].type === "text"
      ? response.content[0].text
      : "";

    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    const result = JSON.parse(cleaned);

    result.deepCritique = !!deepCritique;

    return NextResponse.json(result);

  } catch (err) {
    console.error("Audit error:", err);
    return NextResponse.json(
      { error: "Audit failed. Please try again." },
      { status: 500 }
    );
  }
}
