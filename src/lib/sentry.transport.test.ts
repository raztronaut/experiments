// @vitest-environment node

import * as Sentry from "@sentry/node";
import sentryTestkit from "sentry-testkit";
import { afterEach, describe, expect, it } from "vitest";

describe("sentry transport wiring", () => {
  afterEach(async () => {
    // Ensure global SDK state doesn't leak across tests
    await Sentry.close(1000);
  });

  it("sends an event through the SDK transport", async () => {
    const { testkit, sentryTransport } = sentryTestkit();

    Sentry.init({
      // DSN format doesn't need to be real since we override transport
      dsn: "https://public@o0.ingest.sentry.io/123",
      transport: sentryTransport,
      tracesSampleRate: 0,
      sendDefaultPii: false,
      debug: false,
    });

    const err = new Error("transport smoke test");
    Sentry.captureException(err);
    await Sentry.flush(1000);

    // Reports are delivered async; wait briefly for the testkit to receive them.
    const deadline = Date.now() + 1000;
    let reports = testkit.reports();
    while (reports.length === 0 && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 25));
      reports = testkit.reports();
    }

    expect(reports.length).toBeGreaterThan(0);

    const first = testkit.getExceptionAt(0);
    expect(first).toBeDefined();

    const message = first?.message;
    expect(message).toBe("transport smoke test");
  });
});
