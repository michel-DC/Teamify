import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json(
    { message: "Déconnexion réussie" },
    { status: 200 }
  );

  res.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  res.cookies.set({ name: "isLoggedIn", value: "", path: "/", maxAge: 0 });
  res.cookies.set({ name: "hasOrganization", value: "", path: "/", maxAge: 0 });

  return res;
}
