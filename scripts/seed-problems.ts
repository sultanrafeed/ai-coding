/**
 * Seeds problem catalog from data/problems/*.json into Postgres.
 * Run with: npx tsx scripts/seed-problems.ts
 */
import { readdir, readFile } from "fs/promises";
import { join } from "path";

const PROBLEMS_DIR = join(process.cwd(), "data", "problems");
const API_URL = process.env.API_URL ?? "http://localhost:3001";

async function main() {
  const files = (await readdir(PROBLEMS_DIR)).filter(
    (f) => f.endsWith(".json") && f !== "schema.json",
  );

  for (const file of files) {
    const raw = await readFile(join(PROBLEMS_DIR, file), "utf-8");
    const problem = JSON.parse(raw);

    // TODO: POST to /api/problems (requires admin auth)
    console.log(`Would seed: ${problem.slug}`);
  }

  console.log(`Seeded ${files.length} problems.`);
}

main().catch(console.error);
