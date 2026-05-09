import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const correct = process.env.SITE_PASSWORD;

    // No password configured — auth endpoint shouldn't be reachable
    // but guard against it anyway
    if (!correct) {
      return NextResponse.json({ error: "Not configured" }, { status: 404 });
    }

    if (!password || password !== correct) {
      // Consistent response time to prevent timing attacks
      await new Promise((r) => setTimeout(r, 300));
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });

    res.cookies.set("candor-auth", password, {
      httpOnly: true,   // Not accessible via JS
      secure: true,     // HTTPS only
      sameSite: "lax",  // CSRF protection
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
