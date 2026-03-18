import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const captureMessageMock = vi.fn();
const startSpanMock = vi.fn((_: unknown, cb: () => void) => cb());
const setTagMock = vi.fn();

vi.mock("@sentry/nextjs", () => ({
  captureMessage: (...args: unknown[]) => captureMessageMock(...args),
  startSpan: (ctx: unknown, cb: () => void) => startSpanMock(ctx, cb),
  setTag: (...args: unknown[]) => setTagMock(...args),
}));

vi.mock("@/lib/sentry", () => ({
  isSentryEnabled: () => true,
}));

import { SentryHealthcheckTrigger } from "./SentryHealthcheckTrigger";

describe("SentryHealthcheckTrigger", () => {
  const originalUrl = window.location.href;

  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/?sentry_test=healthcheck");
  });

  afterEach(() => {
    window.history.replaceState({}, "", originalUrl);
  });

  it("fires once, sends message + span, and removes query param", async () => {
    render(<SentryHealthcheckTrigger />);

    expect(captureMessageMock).toHaveBeenCalledWith("Sentry healthcheck");
    expect(startSpanMock).toHaveBeenCalled();

    expect(window.location.search).not.toContain("sentry_test=healthcheck");
  });
});
