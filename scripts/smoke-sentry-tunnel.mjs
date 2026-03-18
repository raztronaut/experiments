import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? 15_000);

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  let sawTunnel = false;

  page.on("request", (req) => {
    try {
      const url = new URL(req.url());
      if (url.pathname.startsWith("/_t")) {
        sawTunnel = true;
      }
    } catch {
      // ignore
    }
  });

  const url = new URL(baseUrl);
  url.searchParams.set("sentry_test", "prod-verify");

  await page.goto(url.toString(), {
    waitUntil: "domcontentloaded",
    timeout: timeoutMs,
  });

  // Give the client time to emit the event request.
  const deadline = Date.now() + timeoutMs;
  while (!sawTunnel && Date.now() < deadline) {
    await page.waitForTimeout(100);
  }

  await browser.close();

  if (!sawTunnel) {
    fail(
      `Did not observe a request to "/_t". Ensure dev server is running at ${baseUrl} and NEXT_PUBLIC_SENTRY_DSN is set.`
    );
  }

  console.log(`OK: observed tunnel request to "/_t" on ${baseUrl}`);
}

main().catch((e) => {
  fail(e?.stack || String(e));
});
