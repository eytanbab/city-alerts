import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AlarmChart } from "../AlarmChart";
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

describe("AlarmChart Component", () => {
  const mockData = [
    { hour: "10:00", count: 5 },
    { hour: "11:00", count: 10 },
  ];

  it("should render the chart with city title", () => {
    render(<AlarmChart data={mockData} city="חיפה" />);
    expect(screen.getByText(/התפלגות שעתית.*חיפה/)).toBeInTheDocument();
  });

  it("should show empty state message if total is 0", () => {
    render(<AlarmChart data={[]} city="תל אביב" />);
    expect(
      screen.getByText('לא נמצאו נתוני אזעקות עבור "תל אביב"'),
    ).toBeInTheDocument();
  });

  it("should render peak and silent hours insights", () => {
    render(<AlarmChart data={mockData} city="חיפה" />);
    expect(screen.getByText("שעות שיא")).toBeInTheDocument();
    expect(screen.getByText("שעות שקטות")).toBeInTheDocument();
    // 11:00 is peak, 10:00 is min
    expect(screen.getByText(/11:00-12:00/)).toBeInTheDocument();
    expect(screen.getByText(/10:00-11:00/)).toBeInTheDocument();
  });
});
