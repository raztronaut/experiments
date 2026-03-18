import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const captureExceptionMock = vi.fn();
vi.mock("@sentry/nextjs", () => ({
  captureException: (...args: unknown[]) => captureExceptionMock(...args),
}));

import { captureExperimentError, isSentryEnabled } from "./sentry";

describe("sentry", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isSentryEnabled", () => {
    it("returns false when NEXT_PUBLIC_SENTRY_DSN is unset (client)", () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = undefined;
      process.env.SENTRY_DSN = undefined;
      expect(isSentryEnabled()).toBe(false);
    });

    it("returns true when NEXT_PUBLIC_SENTRY_DSN is set", () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = "https://key@o0.ingest.sentry.io/1";
      expect(isSentryEnabled()).toBe(true);
    });
  });

  describe("captureExperimentError", () => {
    it("does not throw when DSN is unset", () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = undefined;
      process.env.SENTRY_DSN = undefined;
      expect(() =>
        captureExperimentError(new Error("test"), undefined, { slug: "x" })
      ).not.toThrow();
      expect(captureExceptionMock).not.toHaveBeenCalled();
    });

    it("calls Sentry.captureException when DSN is set", () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = "https://key@o0.ingest.sentry.io/1";
      const err = new Error("test error");
      captureExperimentError(
        err,
        { componentStack: "at Div" },
        {
          slug: "my-exp",
        }
      );
      expect(captureExceptionMock).toHaveBeenCalledWith(err, {
        extra: { componentStack: "at Div" },
        tags: { slug: "my-exp" },
      });
    });
  });
});
