import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { CompanyService } from "@/lib/services/companyService";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const roles = await db.jobDescription.findMany({
      where: session.orgId ? { orgId: session.orgId } : {},
      orderBy: { createdAt: "desc" },
    });

    const candidates = await db.interview.findMany({
      where: session.orgId ? { orgId: session.orgId } : {},
      include: {
        user: { select: { name: true, email: true } },
        jobDescription: { select: { title: true } },
        report: { select: { overallSummary: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ roles, candidates });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch company data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const createdRole = await CompanyService.createRole(session.orgId || "default_org", body);
    return NextResponse.json({ success: true, role: createdRole });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create role" }, { status: 500 });
  }
}
