import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    const errorRedirectUrl = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/auth/login?error=google_oauth_denied`;
    return NextResponse.redirect(errorRedirectUrl);
  }

  if (!code) {
    const noCodeRedirectUrl = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/auth/login?error=google_oauth_no_code`;
    return NextResponse.redirect(noCodeRedirectUrl);
  }

  const redirectUrl = `${
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  }/auth/google-callback?code=${encodeURIComponent(code)}`;

  return NextResponse.redirect(redirectUrl);
}
