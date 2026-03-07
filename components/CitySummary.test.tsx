import { render, screen } from "@testing-library/react";
import { CitySummary } from "./CitySummary";
import { describe, it, expect } from "vitest";
import { type CitySummaryData } from "@/lib/data";

describe("CitySummary", () => {
  const mockData: CitySummaryData = {
    last24h: 5,
    prev24h: 2,
    percentChange: 150,
    weeklyAvg: 3.5,
    summaryText: "במהלך היממה האחרונה, אשקלון חוותה 5 סבבי אזעקות.",
    longestQuietStreakDays: 2,
    isPeakIntensity: false,
  };

  it("should render the city name and summary text", () => {
    render(<CitySummary data={mockData} city="אשקלון" />);
    expect(screen.getByText(/סקירה מהירה: אשקלון/)).toBeDefined();
    expect(screen.getByText(mockData.summaryText)).toBeDefined();
  });

  it("should render the metrics correctly", () => {
    render(<CitySummary data={mockData} city="אשקלון" />);
    expect(screen.getByText("5")).toBeDefined();
    expect(screen.getByText("3.5")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
  });

  it("should render peak intensity badge if true", () => {
    const peakData = { ...mockData, isPeakIntensity: true };
    render(<CitySummary data={peakData} city="אשקלון" />);
    expect(screen.getByText("יום שיא")).toBeDefined();
  });
});
