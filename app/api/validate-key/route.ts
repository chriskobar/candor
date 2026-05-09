import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userApiKey } = await req.json();

    if (!userApiKey || !userApiKey.startsWith("sk-ant-")) {
      return NextResponse.json(
        { valid: false, error: "Invalid API key format. Keys begin with sk-ant-." },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey: userApiKey });

    // Cheapest possible call — 1 output token — to confirm the key is live
    await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1,
      messages: [{ role: "user", content: "hi" }],
    });

    return NextResponse.json({ valid: true });
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status === 401) {
      return NextResponse.json(
        { valid: false, error: "API key not recognised. Please check it and try again." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { valid: false, error: "Could not verify key. Please try again." },
      { status: 500 }
    );
  }
}
