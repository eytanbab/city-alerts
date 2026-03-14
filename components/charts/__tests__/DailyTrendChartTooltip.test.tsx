/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DailyTrendChart } from "../DailyTrendChart";
import * as React from "react";

// Robust mock for Recharts that ensures children are rendered in the DOM
vi.mock("recharts", async () => {
  const OriginalModule = await vi.importActual("recharts");
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
    Line: () => <div data-testid="line" />,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Legend: () => null,
    Tooltip: (props: any) => {
      // Recharts Tooltip renders its content prop
      if (props.content && React.isValidElement(props.content)) {
        // The component passed to content will have the formatter in its props
        const formatter = (props.content.props as any).formatter;
        
        if (formatter) {
          return (
            <div data-testid="mock-tooltip">
              <div data-testid="formatter-positive">
                {formatter(20, "אזעקות", { 
                  payload: { count: 20, pct: 100 },
                  color: "red"
                })}
              </div>
              <div data-testid="formatter-negative">
                {formatter(5, "אזעקות", { 
                  payload: { count: 5, pct: -50 },
                  color: "green"
                })}
              </div>
              <div data-testid="formatter-neutral">
                {formatter(10, "אזעקות", { 
                  payload: { count: 10, pct: 0 },
                  color: "gray"
                })}
              </div>
            </div>
          );
        }
      }
      return <div data-testid="no-formatter" />;
    }
  };
});

describe("DailyTrendChart Tooltip Formatter", () => {
  const mockData = [
    { date: "2026-03-01", count: 10 },
    { date: "2026-03-02", count: 20 },
  ];

  it("should render the formatter with correct percentage and labels", () => {
    render(<DailyTrendChart data={mockData} />);
    
    // Check positive change
    const positive = screen.getByTestId("formatter-positive");
    expect(positive).toHaveTextContent("אזעקות");
    expect(positive).toHaveTextContent("20");
    expect(positive).toHaveTextContent("(+100%)");

    // Check negative change
    const negative = screen.getByTestId("formatter-negative");
    expect(negative).toHaveTextContent("(-50%)");

    // Check neutral (zero) change
    const neutral = screen.getByTestId("formatter-neutral");
    expect(neutral).toHaveTextContent("(0%)");
  });
});
