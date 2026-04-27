import { NextResponse } from "next/server";

const COOKIE_NAME = "payload-token";

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

/**
 * POST: Set the payload-token cookie on the frontend domain so
 * Server Components can forward it to the API backend.
 *
 * Use `NextResponse.cookies.set` (not `cookies().set` from next/headers) so
 * Set-Cookie is reliably applied in Next.js 15 App Router route handlers.
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

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    ...cookieOpts,
    ...(typeof exp === "number" && Number.isFinite(exp)
      ? { expires: new Date(exp * 1000) }
      : {}),
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
