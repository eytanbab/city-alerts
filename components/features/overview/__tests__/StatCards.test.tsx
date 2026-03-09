import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCards } from "../StatCards";
import { GlobalStats } from "@/lib/types";

describe("StatCards Component", () => {
  const mockStats: GlobalStats = {
    totalAlarms: 1234,
    topCityName: "שדרות",
    topCityCount: 56,
    activeDays: 10,
    affectedCitiesCount: 45,
  };

  it("should render all statistic cards with correct data", () => {
    render(<StatCards stats={mockStats} />);

    // Check total alarms
    expect(screen.getByText('סה"כ אזעקות')).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();

    // Check top city
    expect(screen.getByText("העיר המטווחת")).toBeInTheDocument();
    expect(screen.getByText("שדרות")).toBeInTheDocument();
    expect(screen.getByText("56 אירועים")).toBeInTheDocument();

    // Check active days
    expect(screen.getByText("ימי פעילות")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();

    // Check affected cities
    expect(screen.getByText("יישובים בטווח")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
  });

  it("should return null if stats are not provided", () => {
    // @ts-expect-error - Testing null input for safety check
    const { container } = render(<StatCards stats={null} />);
    expect(container.firstChild).toBeNull();
  });
});
