import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const interviews = await db.interview.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      include: {
        report: { select: { id: true } },
      },
    });

    return NextResponse.json({ interviews });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch interviews" }, { status: 500 });
  }
}
