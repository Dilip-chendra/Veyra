import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await db.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      // Return safe success message even if email not registered to protect user privacy
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a verification code has been generated.",
      });
    }

    // Generate a secure 6-digit numeric verification code
    const resetCode = Math.floor(100000 + crypto.randomInt(900000)).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetCode,
        resetTokenExpiry: expiry,
      },
    });

    console.log(`\n======================================================`);
    console.log(`[Veyra Auth] Password Reset Code for ${cleanEmail}: ${resetCode}`);
    console.log(`[Veyra Auth] Valid until: ${expiry.toISOString()}`);
    console.log(`======================================================\n`);

    return NextResponse.json({
      success: true,
      message: "A 6-digit verification code has been generated and is ready to use.",
      resetCode, // Returned for frictionless local/developer testing & instant recovery
    });
  } catch (err: any) {
    console.error("[Veyra Auth] Forgot password error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process password reset request." },
      { status: 500 }
    );
  }
}
