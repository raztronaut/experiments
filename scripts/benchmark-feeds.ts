import { performance } from "node:perf_hooks";
import { GET as getAtomXml } from "../src/app/atom.xml/route";
import { GET as getFeedJson } from "../src/app/feed.json/route";
import { GET as getFeedXml } from "../src/app/feed.xml/route";

async function runBenchmark(name: string, fn: () => Promise<Response>) {
  const start = performance.now();
  await fn();
  const end = performance.now();
  console.log(`${name} took ${(end - start).toFixed(2)}ms`);
}

async function main() {
  console.log("Warming up...");
  await getFeedJson();
  await getAtomXml();
  await getFeedXml();

  console.log("\nRunning benchmark...");
  await runBenchmark("feed.json", getFeedJson);
  await runBenchmark("atom.xml", getAtomXml);
  await runBenchmark("feed.xml", getFeedXml);
}

main().catch(console.error);
