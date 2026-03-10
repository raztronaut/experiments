import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import LandingPageRevealAnimationPort from "./LandingPageRevealAnimationPort";

test("Landing Page Reveal Animation Port renders correctly", () => {
  render(<LandingPageRevealAnimationPort />);
  const canons = screen.getAllByText("Canon");
  expect(canons.length).toBeGreaterThanOrEqual(1);
});
