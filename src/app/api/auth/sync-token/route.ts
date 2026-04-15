import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "payload-token";

/**
 * POST: Set the payload-token cookie on the frontend domain so
 * Server Components can forward it to the API backend.
 *
 * DELETE: Clear the cookie on logout.
 */
export async function POST(request: Request) {
  const { token, exp } = (await request.json().catch(() => ({}))) as {
    token?: string;
    exp?: number;
  };

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  const jar = await cookies();
  jar.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    ...(exp ? { expires: new Date(exp * 1000) } : {}),
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
