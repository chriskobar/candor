import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import {
  AUDIT_SYSTEM_PROMPT,
  DEEP_AUDIT_SYSTEM_PROMPT,
  buildAuditPrompt,
} from "@/lib/auditPrompt";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mediaType, context, primaryIntent, deepCritique } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

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

    // Pass the mode through so the results page can label it
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
