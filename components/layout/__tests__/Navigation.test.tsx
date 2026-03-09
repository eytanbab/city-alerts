import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navigation } from "../Navigation";

describe("Navigation Component", () => {
  it("should highlight the home link as active when currentPath is '/'", () => {
    render(<Navigation currentPath="/" />);
    const homeLink = screen.getByText("מבט כללי");
    const analysisLink = screen.getByText("ניתוח לפי עיר");

    // Check if the link has active classes (e.g., text-foreground)
    expect(homeLink).toHaveClass("text-foreground");
    expect(analysisLink).toHaveClass("text-muted-foreground");
  });

  it("should highlight the analysis link as active when currentPath is '/analysis'", () => {
    render(<Navigation currentPath="/analysis" />);
    const homeLink = screen.getByText("מבט כללי");
    const analysisLink = screen.getByText("ניתוח לפי עיר");

    expect(homeLink).toHaveClass("text-muted-foreground");
    expect(analysisLink).toHaveClass("text-foreground");
  });

  it("should render correctly in RTL with expected links", () => {
    const { container } = render(<Navigation currentPath="/" />);
    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();

    // Check for Hebrew labels
    expect(screen.getByText("מבט כללי")).toBeInTheDocument();
    expect(screen.getByText("ניתוח לפי עיר")).toBeInTheDocument();
  });
});
