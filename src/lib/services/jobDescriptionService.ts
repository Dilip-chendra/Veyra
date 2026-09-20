import type { ParsedJobDescription, InterviewBlueprint, InterviewerStyle, InterviewDifficulty } from "../../types/index.ts";

export class JobDescriptionService {
  public static parseJobDescription(rawText: string, titleHint?: string, companyHint?: string): ParsedJobDescription {
    const text = rawText.trim();
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

    // Extract title
    let title = titleHint || "Software Engineer";
    if (!titleHint && lines.length > 0) {
      const firstLine = lines[0];
      if (firstLine.length < 80 && !firstLine.includes(".")) {
        title = firstLine.replace(/^(Job Title|Position|Role):\s*/i, "");
      }
    }

    // Determine seniority
    let seniority = "Mid-Level";
    if (/junior|entry|intern|graduate|associate/i.test(text)) seniority = "Junior";
    else if (/staff|principal|director|architect|lead/i.test(text)) seniority = "Staff/Principal";
    else if (/senior|sr\./i.test(text)) seniority = "Senior";

    // Known tech catalog to extract real matches
    const techCatalog = [
      "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Express",
      "Java", "Spring Boot", "Go", "Golang", "C++", "C#", ".NET", "Rust",
      "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Kafka", "RabbitMQ",
      "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "CI/CD",
      "GraphQL", "REST", "gRPC", "Microservices", "System Design",
      "PyTorch", "TensorFlow", "LLM", "RAG", "LangChain", "Vector DB", "Computer Vision", "NLP"
    ];

    const requiredSkills: string[] = [];
    const preferredSkills: string[] = [];

    const lowerText = text.toLowerCase();
    for (const tech of techCatalog) {
      const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      if (regex.test(text)) {
        if (lowerText.includes("preferred") || lowerText.includes("nice to have") || lowerText.includes("plus")) {
          // Check position relative to preferred section
          const preferredIdx = Math.min(
            lowerText.indexOf("preferred") === -1 ? Infinity : lowerText.indexOf("preferred"),
            lowerText.indexOf("nice to have") === -1 ? Infinity : lowerText.indexOf("nice to have")
          );
          const techIdx = lowerText.indexOf(tech.toLowerCase());
          if (techIdx > preferredIdx && preferredIdx !== Infinity) {
            preferredSkills.push(tech);
            continue;
          }
        }
        requiredSkills.push(tech);
      }
    }

    // Responsibilities extraction
    const responsibilities: string[] = [];
    let inResponsibilities = false;
    for (const line of lines) {
      if (/responsibilities|what you('ll| will) do|duties|your role/i.test(line)) {
        inResponsibilities = true;
        continue;
      }
      if (/requirements|qualifications|skills|benefits|what we offer/i.test(line)) {
        inResponsibilities = false;
      }
      if (inResponsibilities && (line.startsWith("•") || line.startsWith("-") || line.startsWith("*"))) {
        responsibilities.push(line.replace(/^[•\-*]\s*/, ""));
      }
    }

    // Technical competencies
    const technicalCompetencies: string[] = [];
    if (/system design|distributed systems|scalability|high throughput/i.test(text)) {
      technicalCompetencies.push("Distributed Systems Architecture");
    }
    if (/algorithm|data structures|optimization|low latency/i.test(text)) {
      technicalCompetencies.push("Algorithms & Complexity");
    }
    if (/api design|rest|grpc|microservice/i.test(text)) {
      technicalCompetencies.push("API & Microservices Architecture");
    }
    if (/database|sql|schema|postgres|redis/i.test(text)) {
      technicalCompetencies.push("Data Modeling & Query Optimization");
    }
    if (/machine learning|llm|rag|deep learning|embeddings/i.test(text)) {
      technicalCompetencies.push("Applied ML & Generative AI Systems");
    }
    if (technicalCompetencies.length === 0) {
      technicalCompetencies.push("Core Software Engineering & Best Practices");
    }

    // Behavioral competencies
    const behavioralCompetencies: string[] = [
      "Technical Ownership & Initiative",
      "Trade-off Communication",
      "Navigating Ambiguity",
    ];

    return {
      title,
      company: companyHint || "Target Organization",
      role: title,
      seniority,
      requiredSkills: requiredSkills.length > 0 ? requiredSkills : ["Software Engineering", "Problem Solving"],
      preferredSkills,
      responsibilities: responsibilities.length > 0 ? responsibilities : ["Design and implement robust software solutions"],
      technicalCompetencies,
      behavioralCompetencies,
    };
  }

  public static generateBlueprint(
    jd: ParsedJobDescription,
    durationMinutes: number = 30,
    style: InterviewerStyle = "PROFESSIONAL",
    difficulty: InterviewDifficulty = "ADAPTIVE"
  ): InterviewBlueprint {
    const isShort = durationMinutes <= 20;
    const isLong = durationMinutes >= 45;

    const stages = [
      {
        name: "Introduction & Context",
        targetMinutes: isShort ? 3 : 5,
        objectives: ["Establish candidate background", "Clarify target role context", "Set conversation tone"],
        focusAreas: ["Background overview", "Key passions"],
      },
      {
        name: "Project & Claim Deep Dive",
        targetMinutes: isShort ? 6 : (isLong ? 12 : 8),
        objectives: ["Probe past architectural decisions", "Verify technical claims", "Evaluate depth of implementation"],
        focusAreas: jd.technicalCompetencies.slice(0, 2),
      },
      {
        name: "Core Technical Competency",
        targetMinutes: isShort ? 6 : (isLong ? 15 : 10),
        objectives: ["Test foundational reasoning", "Probe failure modes and edge cases", "Evaluate trade-off justification"],
        focusAreas: jd.requiredSkills.slice(0, 3),
      },
      {
        name: "System Architecture / Problem Solving",
        targetMinutes: isShort ? 4 : (isLong ? 10 : 5),
        objectives: ["Present scaling scenario", "Evaluate capacity planning", "Observe adaptation to changing constraints"],
        focusAreas: ["Scalability", "Reliability", "Data consistency"],
      },
      {
        name: "Behavioral & Closing",
        targetMinutes: isShort ? 3 : (isLong ? 8 : 4),
        objectives: ["STAR ownership example", "Assess candidate questions for interviewer", "Close session professionally"],
        focusAreas: ["Engineering ownership", "Candidate inquiries"],
      },
    ];

    const initialQuestion = `Welcome. To kick off our session for the ${jd.title} role, give me a concise overview of your background and the most architecturally challenging project you've owned recently.`;

    return {
      title: `${jd.title} Interview Blueprint`,
      role: jd.title,
      durationMinutes,
      difficulty,
      style,
      stages,
      initialQuestion,
      expectedCompetencies: [...jd.technicalCompetencies, ...jd.behavioralCompetencies],
    };
  }
}
