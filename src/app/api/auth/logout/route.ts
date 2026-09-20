import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Logged out successfully" });
  const cookie = clearSessionCookie();
  res.cookies.set(cookie.name, cookie.value, cookie);
  return res;
}
