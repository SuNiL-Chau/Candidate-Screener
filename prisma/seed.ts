import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { runAnalysisPipeline } from "../src/services/analysis.service";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create default recruiter user
  const user = await prisma.user.upsert({
    where: { email: "recruiter@crystalgroup.com" },
    update: {},
    create: {
      email: "recruiter@crystalgroup.com",
    },
  });

  console.log(`Recruiter user verified: ${user.email}`);

  // 2. Create sample Senior Full Stack Engineer role
  const role = await prisma.role.create({
    data: {
      title: "Senior Full Stack Engineer",
      description: "Join Crystal Group to build high-scale, AI-native recruiting and evaluation platforms with Next.js, TypeScript, and modern distributed cloud backends.",
      requirements: [
        "TypeScript",
        "React / Next.js",
        "Node.js",
        "PostgreSQL",
        "System Architecture",
        "Security & AI Trust",
      ],
      createdById: user.id,
    },
  });

  console.log(`Created sample role: ${role.title} (${role.id})`);

  // 3. Load fixtures
  const fixturesDir = path.join(process.cwd(), "tests", "fixtures");

  const candidatesData = [
    {
      name: "Alex Rivera",
      email: "alex.rivera@example.com",
      file: "clean-resume.txt",
    },
    {
      name: "Morgan Vance",
      email: "morgan.vance@example.com",
      file: "prompt-injection.txt",
    },
    {
      name: "Taylor Hayes",
      email: "taylor.hayes@example.com",
      file: "overlapping-employment.txt",
    },
    {
      name: "Jordan Blake",
      email: "jordan.blake@example.com",
      file: "templated-inflation.txt",
    },
    {
      name: "Samantha Reed",
      email: "samantha.reed@example.com",
      file: "legitimate-overlap.txt",
    },
  ];

  for (const c of candidatesData) {
    const filePath = path.join(fixturesDir, c.file);
    const resumeText = fs.readFileSync(filePath, "utf-8");

    const candidate = await prisma.candidate.create({
      data: {
        roleId: role.id,
        name: c.name,
        email: c.email,
        resumeText,
      },
    });

    console.log(`Created candidate ${candidate.name}, running analysis pipeline...`);
    await runAnalysisPipeline(candidate.id);
  }

  console.log("Seeding successfully completed! All sample candidates analyzed.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
