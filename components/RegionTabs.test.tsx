import { render, screen, fireEvent } from "@testing-library/react";
import { RegionTabs } from "./RegionTabs";
import { describe, it, expect, vi } from "vitest";

describe("RegionTabs", () => {
  it("should render all region triggers", () => {
    const onValueChange = vi.fn();
    render(<RegionTabs value="all" onValueChange={onValueChange} />);

    expect(screen.getByRole("tab", { name: "צפון" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "מרכז" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "דרום" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "ארצי" })).toBeDefined();
  });

  it("should call onValueChange when a tab is clicked", () => {
    const onValueChange = vi.fn();
    render(<RegionTabs value="all" onValueChange={onValueChange} />);

    const northTab = screen.getByRole("tab", { name: "צפון" });
    // Radix often listens for keyboard or pointer events
    fireEvent.keyDown(northTab, { key: " ", code: "Space" });
    fireEvent.click(northTab);

    expect(onValueChange).toHaveBeenCalledWith("צפון");
  });
});
