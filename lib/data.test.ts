import { describe, it, expect } from "vitest";
import {
  normalizeCityName,
  getHourlyDistribution,
  processRawAlarms,
  Alarm,
} from "./data";

describe("Data Utility Functions (Optimized)", () => {
  it("should normalize city names by removing sectors and parentheses", () => {
    expect(normalizeCityName("חיפה - כרמל")).toBe("חיפה");
    expect(normalizeCityName("אשדוד - יא (מרכז)")).toBe("אשדוד");
  });

  it("should calculate hourly distribution correctly (minute-based aggregation)", () => {
    const alarms: Alarm[] = [
      { datetime: "2026-02-28 10:00:00", city: "חיפה" },
      { datetime: "2026-02-28 10:15:00", city: "חיפה" },
    ];
    const dist = getHourlyDistribution(alarms, "חיפה");
    const tenAm = dist.find((d) => d.hour === "10:00");
    expect(tenAm?.count).toBe(2);

    const sameMinAlarms: Alarm[] = [
      { datetime: "2026-02-28 10:00:00", city: "חיפה - א" },
      { datetime: "2026-02-28 10:00:30", city: "חיפה - ב" },
    ];
    const sameMinDist = getHourlyDistribution(sameMinAlarms, "חיפה");
    expect(sameMinDist.find((d) => d.hour === "10:00")?.count).toBe(1);
  });

  it("should process raw alarms into dashboard data correctly", () => {
    // [group_id, threat_id, [cities], unix_timestamp]
    const rawAlarms: [number, number, string[], number][] = [
      [1, 0, ["חיפה - כרמל", "חיפה - מערב"], 1772186400], // 2026-02-28 10:00:00
      [2, 0, ["תל אביב - יפו"], 1772186460], // 2026-02-28 10:01:00
      [3, 0, ["חיפה - כרמל"], 1772186405], // 2026-02-28 10:00:05 (Same minute as #1)
    ];

    const citiesMetadata = {
      "חיפה - כרמל": { id: 101, lat: 32.8, lng: 34.9 },
      "חיפה - מערב": { id: 102, lat: 32.7, lng: 34.8 },
      "תל אביב - יפו": { id: 201, lat: 32.0, lng: 34.7 },
    };

    const polygonsRaw: Record<string, [number, number][]> = {
      "101": [
        [32.0, 34.0],
        [32.1, 34.1],
      ],
      "201": [
        [32.5, 34.5],
        [32.6, 34.6],
      ],
    };

    const filterDateUnix = 1772150400; // 2026-02-28 00:00:00

    const result = processRawAlarms(
      rawAlarms,
      citiesMetadata,
      polygonsRaw,
      filterDateUnix,
    );

    // Total Sirens (raw count) = 2 (entry 1) + 1 (entry 2) + 1 (entry 3) = 4
    expect(result.stats?.totalAlarms).toBe(4);

    // Affected CitiesCount (unique base cities) = חיפה, תל אביב = 2
    expect(result.stats?.affectedCitiesCount).toBe(2);

    // Top City Events (minute-based):
    // חיפה: 10:00 (from entries 1 & 3) = 1 event
    // תל אביב: 10:01 (from entry 2) = 1 event
    expect(result.stats?.topCityCount).toBe(1);

    // Map Data (sector based)
    expect(result.mapData).toHaveLength(3);
    const haifaCarmel = result.mapData.find((m) => m.city === "חיפה - כרמל");
    expect(haifaCarmel?.count).toBe(2);
    expect(haifaCarmel?.polygon).toBeDefined();

    // Daily Trend (minute-based unique events)
    // 2026-02-28: חיפה (10:00), תל אביב (10:01) = 2 total events
    expect(result.globalDailyTrend[0].count).toBe(2);
  });
});
