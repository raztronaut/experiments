import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

const DUE_FLAG_PATH = resolve(".cursor/hooks/state/learning-due.json");
const INCREMENTAL_INDEX_PATH = resolve(
  ".cursor/hooks/state/continual-learning-index.json"
);

const REMINDER = `Continual learning is due — when convenient, run the \`continual-learning\` skill to update \`memory.md\`. First read existing \`memory.md\` and update existing entries in place (do not only append). Use incremental transcript processing with index file \`${INCREMENTAL_INDEX_PATH}\`: only read transcripts not in the index or transcripts whose mtime is newer than indexed mtime (re-read changed transcripts). After processing, write back the updated index mtimes and remove entries for deleted transcripts. Update \`memory.md\` only for high-signal, repeated user-correction patterns or durable workspace facts. Exclude one-off/transient details and secrets. Keep each learned section to at most 12 bullets. Write plain bullet points only, with no evidence/confidence tags or other metadata annotations. If no meaningful updates exist, respond exactly: No high-signal memory updates.`;

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

async function main() {
  try {
    await readStdin();

    if (!existsSync(DUE_FLAG_PATH)) {
      console.log(JSON.stringify({}));
      return 0;
    }

    try {
      const raw = readFileSync(DUE_FLAG_PATH, "utf-8");
      JSON.parse(raw);
    } catch {
      unlinkSync(DUE_FLAG_PATH);
      console.log(JSON.stringify({}));
      return 0;
    }

    unlinkSync(DUE_FLAG_PATH);

    console.log(
      JSON.stringify({
        additional_context: REMINDER,
      })
    );
    return 0;
  } catch (error) {
    console.error("[continual-learning-start] failed", error);
    console.log(JSON.stringify({}));
    return 0;
  }
}

const exitCode = await main();
process.exit(exitCode);
