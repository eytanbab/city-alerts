import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Leaderboard } from "../Leaderboard";

describe("Leaderboard Component", () => {
  const mockData = [
    { name: "אשקלון", count: 150 },
    { name: "אשדוד", count: 120 },
    { name: "שדרות", count: 90 },
  ];

  it("should render the leaderboard with correct city names and counts", () => {
    render(<Leaderboard data={mockData} onSelect={() => {}} />);

    expect(screen.getByText("אשקלון")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("אשדוד")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("שדרות")).toBeInTheDocument();
    expect(screen.getByText("90")).toBeInTheDocument();
  });

  it("should call onSelect when a city is clicked", () => {
    const onSelectMock = vi.fn();
    render(<Leaderboard data={mockData} onSelect={onSelectMock} />);

    const cityRow = screen.getByText("אשקלון").closest("button");
    if (cityRow) {
      fireEvent.click(cityRow);
    }

    expect(onSelectMock).toHaveBeenCalledWith("אשקלון");
  });

  it("should render empty state if no data provided", () => {
    render(<Leaderboard data={[]} onSelect={() => {}} />);
    expect(screen.queryByText("אשקלון")).not.toBeInTheDocument();
  });
});
