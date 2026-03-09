import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DailyTrendChart } from "../DailyTrendChart";
import * as React from "react";

// Mocking Recharts to avoid issues with SVG rendering in JSDOM
vi.mock("recharts", async () => {
  const OriginalModule = await vi.importActual("recharts");
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

describe("DailyTrendChart Component", () => {
  const mockData = [
    { date: "2026-03-01", count: 10 },
    { date: "2026-03-02", count: 20 },
  ];

  it("should render with title and description", () => {
    render(
      <DailyTrendChart
        data={mockData}
        title="מגמה מותאמת"
        description="תיאור בדיקה"
      />,
    );
    expect(screen.getByText("מגמה מותאמת")).toBeInTheDocument();
    expect(screen.getByText("תיאור בדיקה")).toBeInTheDocument();
  });

  it("should render insights correctly", () => {
    render(<DailyTrendChart data={mockData} />);

    // Check for insights labels
    expect(screen.getByText("יום שיא")).toBeInTheDocument();
    expect(screen.getByText("ממוצע יומי")).toBeInTheDocument();
    expect(screen.getByText("מגמה יומית")).toBeInTheDocument();

    // Check for data values
    // Peak day: 2026-03-02 -> 02/03 (20 counts)
    expect(screen.getByText(/02\/03/)).toBeInTheDocument();
    expect(screen.getByText(/20/)).toBeInTheDocument();
    // Average: (10 + 20) / 2 = 15
    expect(screen.getByText("15")).toBeInTheDocument();
    // Trend: (20 - 10) / 10 = 100%
    expect(screen.getByText("+100%")).toBeInTheDocument();
  });

  it("should return null if total count is 0", () => {
    const { container } = render(<DailyTrendChart data={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
