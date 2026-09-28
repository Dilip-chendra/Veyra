import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const interview = await db.interview.findUnique({
      where: { id },
      include: {
        report: true,
        trainingPlans: { include: { exercises: true } },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // Tenant / User Isolation: Ensure user owns this interview or is authorized admin/employer
    if (interview.userId !== session.userId && session.role !== "ADMIN" && session.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Forbidden: You cannot access another candidate's report" }, { status: 403 });
    }

    return NextResponse.json({
      interview,
      report: interview.report,
      trainingPlan: interview.trainingPlans[0] || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch report data" }, { status: 500 });
  }
}
