import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Email, verification code, and new password are required." },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();

    const user = await db.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or verification code." },
        { status: 400 }
      );
    }

    if (!user.resetToken || user.resetToken !== cleanCode) {
      return NextResponse.json(
        { error: "Invalid verification code. Please check your code and try again." },
        { status: 400 }
      );
    }

    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Hash the new password with bcrypt
    const passwordHash = await hashPassword(newPassword);

    // Update user record and clear reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    console.log(`[Veyra Auth] Password successfully reset for user ${cleanEmail}`);

    // Create session token and set session cookie so the user can be immediately authenticated
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      orgId: user.orgId,
    });

    const res = NextResponse.json({
      success: true,
      message: "Password has been successfully updated.",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

    const cookie = setSessionCookie(token);
    res.cookies.set(cookie.name, cookie.value, cookie);
    return res;
  } catch (err: any) {
    console.error("[Veyra Auth] Reset password error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to reset password." },
      { status: 500 }
    );
  }
}
