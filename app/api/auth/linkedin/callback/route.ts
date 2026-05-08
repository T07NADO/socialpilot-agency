import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(`${origin}/clients?error=linkedin_denied`);
  }

  let clientId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    clientId = decoded.clientId;
    if (!clientId) throw new Error("Missing clientId in state");
  } catch {
    return NextResponse.redirect(`${origin}/clients?error=invalid_state`);
  }

  // Exchange authorization code for access token
  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${origin}/api/auth/linkedin/callback`,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${origin}/clients/${clientId}?error=linkedin_token`);
  }

  const tokenData = await tokenRes.json();
  const accessToken: string = tokenData.access_token;
  const expiresIn: number = tokenData.expires_in ?? 5183944; // default ~60 days

  // Fetch LinkedIn profile via OpenID Connect userinfo endpoint
  const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileRes.ok) {
    return NextResponse.redirect(`${origin}/clients/${clientId}?error=linkedin_profile`);
  }

  const profile = await profileRes.json();
  // profile.sub = LinkedIn person ID used as author URN
  // profile.name = full display name

  const pendingData = JSON.stringify({
    clientId,
    profileId: profile.sub,
    profileName: profile.name ?? profile.email ?? "LinkedIn User",
    accessToken,
    expiresAt: Date.now() + expiresIn * 1000,
  });

  const response = NextResponse.redirect(
    `${origin}/clients/${clientId}?linkedin_connected=1`
  );

  response.cookies.set("linkedin_pending", pendingData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300, // 5 minutes — just long enough to complete the save
    path: "/",
  });

  return response;
}
