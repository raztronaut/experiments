import fs from "fs/promises";

async function run() {
  let content = await fs.readFile("src/lib/articles.ts", "utf-8");
  content = content.replace(
    /readingMinutes: Math\.max\(1, Math\.ceil\(\(content\.match\(\/\\S\+\/g\)\?\.length \?\? 0\) \/ 200\)\),/,
    `readingMinutes: Math.max(
                1,
                Math.ceil((content.match(/\\S+/g)?.length ?? 0) / 200)
              ),`
  );
  content = content.replace(
    /return \{ frontmatter: data, content, readingMinutes: Math\.max\(1, Math\.ceil\(words \/ 200\)\) \};/,
    `return {
        frontmatter: data,
        content,
        readingMinutes: Math.max(1, Math.ceil(words / 200)),
      };`
  );
  await fs.writeFile("src/lib/articles.ts", content);
}
run();
