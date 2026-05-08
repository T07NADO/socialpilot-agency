import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get("linkedin_pending");
  if (!cookie) {
    return NextResponse.json({ error: "No pending connection found" }, { status: 400 });
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(cookie.value);
  } catch {
    return NextResponse.json({ error: "Invalid pending data" }, { status: 400 });
  }

  const response = NextResponse.json(data);
  // Clear the cookie immediately after reading — one-time use
  response.cookies.set("linkedin_pending", "", { maxAge: 0, path: "/" });
  return response;
}
