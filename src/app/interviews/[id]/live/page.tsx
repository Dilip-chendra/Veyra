import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { LiveRoom } from "@/components/interview/LiveRoom";

export default async function LiveInterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const { id } = await params;

  const interview = await db.interview.findUnique({
    where: { id },
  });

  if (!interview) {
    notFound();
  }

  const blueprint = JSON.parse(interview.blueprint || "{}");
  const initialQuestion =
    blueprint.initialQuestion ||
    `Welcome to our session for the ${interview.role} position. To start, give me a concise overview of your background and the most architecturally challenging project you've owned recently.`;

  const isEmployerReview = session?.role === "EMPLOYER" || session?.role === "ADMIN";

  const bp = JSON.parse(interview.blueprint || "{}");
  const interviewerGender: "female" | "male" =
    bp.interviewerGender === "male" || interview.title?.includes("Marcus")
      ? "male"
      : "female";
  const interviewerName =
    bp.interviewerName || (interviewerGender === "male" ? "Marcus Vance" : "Elena Rostova");
  const interviewerTitle =
    bp.interviewerTitle ||
    (interviewerGender === "male"
      ? "Senior Engineering Director"
      : "VP of Engineering & Principal Technical Architect");

  return (
    <LiveRoom
      interviewId={interview.id}
      roleTitle={interview.role}
      durationMinutes={interview.durationMinutes}
      initialQuestion={initialQuestion}
      interviewerGender={interviewerGender}
      interviewerName={interviewerName}
      interviewerTitle={interviewerTitle}
      isEmployerReview={isEmployerReview}
    />
  );
}
