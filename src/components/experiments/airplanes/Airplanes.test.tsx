import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Airplanes from "./Airplanes";

test("Airplanes renders correctly", () => {
  render(<Airplanes />);
  expect(screen.getByText("Airplanes")).toBeDefined();
});
