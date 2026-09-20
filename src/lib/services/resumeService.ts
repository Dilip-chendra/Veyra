import type { ParsedResume } from "../../types/index.ts";

export class ResumeService {
  public static parseResumeText(rawText: string): ParsedResume {
    const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);

    const technologies: Set<string> = new Set();
    const claims: string[] = [];
    const metrics: string[] = [];

    // Common technology list
    const techDictionary = [
      "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Express",
      "FastAPI", "Django", "Flask", "Go", "Golang", "Java", "Spring Boot", "Rust", "C++",
      "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Kafka", "RabbitMQ",
      "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "GraphQL", "REST",
      "PyTorch", "TensorFlow", "LLM", "RAG", "LangChain", "Vector DB", "Chroma", "Pinecone",
      "Qdrant", "Weaviate", "Celery", "Pandas", "NumPy", "Scikit-Learn", "HuggingFace"
    ];

    for (const tech of techDictionary) {
      const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      if (regex.test(rawText)) {
        technologies.add(tech);
      }
    }

    // Extract quantified metric statements (claims)
    // e.g., "reduced latency by 40%", "scaled to 100k users", "improved throughput 3x"
    const metricRegex = /(reduced|increased|improved|scaled|cut|saved|optimized|accelerated|handled)\s+[^.!?\n]*(?:\d+[%xXkKM]|\$\d+)[^.!?\n]*/gi;
    let match;
    while ((match = metricRegex.exec(rawText)) !== null) {
      const statement = match[0].trim();
      if (statement.length > 15 && statement.length < 180) {
        metrics.push(statement);
        claims.push(statement);
      }
    }

    // Extract specific project or system claims
    const claimKeywords = ["built", "designed", "architected", "deployed", "implemented", "migrated", "engineered"];
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (claimKeywords.some(kw => lower.includes(kw)) && line.length > 30 && line.length < 200) {
        if (!claims.includes(line)) {
          claims.push(line);
        }
      }
    }

    // Work Experience & Projects extraction heuristics
    const experience: ParsedResume["experience"] = [];
    const projects: ParsedResume["projects"] = [];
    const education: ParsedResume["education"] = [];

    let currentSection: "NONE" | "EXPERIENCE" | "PROJECTS" | "EDUCATION" = "NONE";

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (/^(experience|work history|employment history|work experience)/i.test(lower)) {
        currentSection = "EXPERIENCE";
        continue;
      } else if (/^(projects|personal projects|technical projects)/i.test(lower)) {
        currentSection = "PROJECTS";
        continue;
      } else if (/^(education|academic background)/i.test(lower)) {
        currentSection = "EDUCATION";
        continue;
      } else if (/^(skills|technologies|certifications|awards)/i.test(lower)) {
        currentSection = "NONE";
        continue;
      }

      if (currentSection === "PROJECTS" && line.length > 10) {
        if (!line.startsWith("•") && !line.startsWith("-")) {
          const parts = line.split(/[|–-]/);
          projects.push({
            name: parts[0]?.trim() || line,
            description: parts.slice(1).join(" - ").trim() || "Project detailed in resume",
            technologies: Array.from(technologies).filter(t => line.includes(t)),
          });
        }
      } else if (currentSection === "EXPERIENCE" && line.length > 10) {
        if (!line.startsWith("•") && !line.startsWith("-") && /developer|engineer|lead|architect|manager|intern|specialist/i.test(line)) {
          const parts = line.split(/[|–-]/);
          experience.push({
            title: parts[0]?.trim() || line,
            company: parts[1]?.trim() || "Technology Company",
            duration: parts[2]?.trim() || "Recent",
            responsibilities: [],
            achievements: [],
          });
        } else if (experience.length > 0 && (line.startsWith("•") || line.startsWith("-"))) {
          const content = line.replace(/^[•\-*]\s*/, "");
          if (/\d+%|\d+x|\$\d+/i.test(content)) {
            experience[experience.length - 1].achievements.push(content);
          } else {
            experience[experience.length - 1].responsibilities.push(content);
          }
        }
      } else if (currentSection === "EDUCATION" && line.length > 5) {
        if (/bachelor|master|phd|b\.s|m\.s|degree|university|college|institute/i.test(line)) {
          education.push({
            institution: line,
            degree: /master|m\.s/i.test(line) ? "Master of Science" : "Bachelor of Science",
            field: /computer|data|software|electrical/i.test(line) ? "Computer Science" : "Engineering",
            year: (line.match(/\b(20\d\d|19\d\d)\b/) || [""])[0],
          });
        }
      }
    }

    return {
      experience,
      education,
      projects,
      technologies: Array.from(technologies),
      skills: Array.from(technologies),
      claims: claims.slice(0, 15),
      metrics: metrics.slice(0, 10),
      rawText,
    };
  }
}
