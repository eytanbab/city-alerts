import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CitySearch } from "./CitySearch";

// Mocking ScrollView and other things that might fail in JSDOM
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe("CitySearch Component", () => {
  const mockCities = ["חיפה", "תל אביב", "אשקלון", "אשדוד", "ירושלים"];
  const onSearchMock = vi.fn();

  it("should render with placeholder text", () => {
    render(<CitySearch cities={mockCities} onSearch={onSearchMock} />);
    expect(screen.getByText("חפש עיר...")).toBeInTheDocument();
  });

  it("should show the selected city label", () => {
    render(
      <CitySearch
        cities={mockCities}
        onSearch={onSearchMock}
        selectedCities={["חיפה"]}
      />,
    );
    expect(screen.getByText("חיפה")).toBeInTheDocument();
  });

  it("should open the search list when clicked", () => {
    render(<CitySearch cities={mockCities} onSearch={onSearchMock} />);
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    expect(screen.getByPlaceholderText("הקלד שם עיר...")).toBeInTheDocument();
    expect(screen.getByText("תל אביב")).toBeInTheDocument();
  });

  it("should filter the list based on search input", async () => {
    render(<CitySearch cities={mockCities} onSearch={onSearchMock} />);
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    const input = screen.getByPlaceholderText("הקלד שם עיר...");
    fireEvent.change(input, { target: { value: "אש" } });

    // Should show אשקלון and אשדוד
    expect(screen.getByText("אשקלון")).toBeInTheDocument();
    expect(screen.getByText("אשדוד")).toBeInTheDocument();

    // Should NOT show חיפה
    expect(screen.queryByText("חיפה")).not.toBeInTheDocument();
  });

  it("should call onSearch and stay open when a city is selected (multi-select)", () => {
    render(<CitySearch cities={mockCities} onSearch={onSearchMock} />);
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    const cityItem = screen.getByText("ירושלים");
    fireEvent.click(cityItem);

    expect(onSearchMock).toHaveBeenCalledWith("ירושלים");
    // Popover should stay open for multi-select
    expect(screen.getByPlaceholderText("הקלד שם עיר...")).toBeInTheDocument();
  });
});
