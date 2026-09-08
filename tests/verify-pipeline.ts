import prisma from "../src/lib/db/prisma";

async function check() {
  const candidates = await prisma.candidate.findMany({
    include: {
      integrityReport: { include: { findings: true } },
      score: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  console.log("\n=======================================================");
  console.log("PIPELINE VERIFICATION RESULTS ACROSS ALL CANDIDATES");
  console.log("=======================================================\n");

  for (const c of candidates) {
    console.log(`Candidate: ${c.name}`);
    console.log(`Fit Score: ${c.score?.score} / 100`);
    console.log(`Integrity Report Status: ${c.integrityReport?.status}`);
    console.log(`Integrity Summary: ${c.integrityReport?.summary}`);
    console.log(`Findings (${c.integrityReport?.findings.length || 0}):`);

    if (!c.integrityReport?.findings.length) {
      console.log("  [CLEAR] No integrity issues detected.");
    } else {
      for (const f of c.integrityReport.findings) {
        console.log(`  • [${f.severity}] [${f.type}] ${f.title}`);
        console.log(`    Evidence: ${f.evidence.replace(/\r?\n/g, " ")}`);
        console.log(`    Why: ${f.explanation}`);
        console.log(`    Recruiter Action: ${f.recommendedAction}`);
      }
    }
    console.log("-------------------------------------------------------");
  }
}

check()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
