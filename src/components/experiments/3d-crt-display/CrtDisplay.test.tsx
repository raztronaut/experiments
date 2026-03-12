import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import CrtDisplay from "./CrtDisplay";

test("3D CRT Display renders project list", () => {
  render(<CrtDisplay />);
  expect(screen.getByText("District")).toBeDefined();
});
