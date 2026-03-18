import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExperimentErrorBoundary } from "./ExperimentErrorBoundary";

const ThrowingChild = () => {
  throw new Error("test error");
};

describe("ExperimentErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ExperimentErrorBoundary>
        <span>Child content</span>
      </ExperimentErrorBoundary>
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders fallback when child throws", () => {
    render(
      <ExperimentErrorBoundary>
        <ThrowingChild />
      </ExperimentErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /try again/i })
    ).toBeInTheDocument();
  });
});
