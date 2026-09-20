import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { CompanyService } from "@/lib/services/companyService";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: interviewId } = await params;

  try {
    const briefing = await CompanyService.executeHumanTakeover(interviewId, session.name || "Human Recruiter");
    return NextResponse.json({ success: true, briefing });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to execute human takeover" }, { status: 500 });
  }
}
