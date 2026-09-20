import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete all interviews (cascading deletes questions, answers, events, reports, training plans)
    await db.interview.deleteMany({
      where: { userId: session.userId },
    });

    // Delete claims
    await db.candidateClaim.deleteMany({
      where: { userId: session.userId },
    });

    return NextResponse.json({ success: true, message: "All interview records purged." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to purge data" }, { status: 500 });
  }
}
