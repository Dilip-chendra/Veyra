import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { ResumeService } from "@/lib/services/resumeService";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    let rawText = "";
    let filename = "Uploaded_Resume.txt";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      rawText = body.text || "";
      filename = body.filename || "Resume.txt";
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      filename = file.name;
      const buffer = await file.arrayBuffer();
      const rawBuffer = Buffer.from(buffer);

      if (filename.toLowerCase().endsWith(".pdf")) {
        // Extract text streams from PDF buffer
        const rawStr = rawBuffer.toString("latin1");
        const textMatches = rawStr.match(/\(([^\)]{2,})\)/g);
        if (textMatches && textMatches.length > 5) {
          rawText = textMatches.map(m => m.slice(1, -1)).join(" ");
        } else {
          // Fallback to printable ASCII characters
          rawText = rawStr.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ");
        }
      } else {
        rawText = rawBuffer.toString("utf-8");
      }
    }

    if (!rawText.trim()) {
      return NextResponse.json({ error: "Could not extract readable text from document. Please paste resume text." }, { status: 400 });
    }

    // Parse resume into structured data
    const parsed = ResumeService.parseResumeText(rawText);

    // Save to database
    const resume = await db.resume.create({
      data: {
        userId: session.userId,
        filename,
        rawText,
        parsedData: JSON.stringify(parsed),
      },
    });

    // Extract quantified claims and insert into Candidate Knowledge Model
    for (const claim of parsed.claims) {
      await db.candidateClaim.create({
        data: {
          userId: session.userId,
          claimText: claim,
          domain: "RESUME_EXPERIENCE",
          source: "RESUME",
          status: "UNTESTED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      resumeId: resume.id,
      filename: resume.filename,
      parsed,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process resume" }, { status: 500 });
  }
}
