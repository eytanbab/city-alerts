import { describe, it, expect } from "vitest";
import {
  normalizeCityName,
  getHourlyDistribution,
  getCityDailyTrend,
  processRawAlarms,
  getRegionForArea,
  getCitySummary,
} from "../data-processor";
import { type Alarm } from "../../types";

describe("Data Utility Functions (Optimized)", () => {
  it("should return the correct region for a given area code", () => {
    expect(getRegionForArea(1)).toBe("צפון");
    expect(getRegionForArea(6)).toBe("צפון");
    expect(getRegionForArea(2)).toBe("דרום");
    expect(getRegionForArea(17)).toBe("דרום");
    expect(getRegionForArea(3)).toBe("מרכז");
    expect(getRegionForArea(undefined)).toBe("מרכז");
  });

  it("should normalize city names by removing sectors and parentheses", () => {
    expect(normalizeCityName("חיפה - כרמל")).toBe("חיפה");
    expect(normalizeCityName("אשדוד - יא (מרכז)")).toBe("אשדוד");
  });

  it("should calculate hourly distribution correctly (minute-based aggregation)", () => {
    const alarms: Alarm[] = [
      { datetime: "2026-02-28 10:00:00", city: "חיפה" },
      { datetime: "2026-02-28 10:15:00", city: "חיפה" },
    ];
    const dist = getHourlyDistribution(alarms);
    const tenAm = dist.find((d) => d.hour === "10:00");
    expect(tenAm?.count).toBe(2);

    const sameMinAlarms: Alarm[] = [
      { datetime: "2026-02-28 10:00:00", city: "חיפה - א" },
      { datetime: "2026-02-28 10:00:30", city: "חיפה - ב" },
    ];
    const sameMinDist = getHourlyDistribution(sameMinAlarms);
    expect(sameMinDist.find((d) => d.hour === "10:00")?.count).toBe(1);
  });

  it("should process raw alarms into dashboard data correctly", () => {
    // [group_id, threat_id, [cities], unix_timestamp]
    const mockRawAlarms: [number, number, string[], number][] = [
      [1, 0, ["חיפה - כרמל", "חיפה - מערב"], 1772186400], // 2026-02-28 10:00:00
      [2, 0, ["תל אביב - יפו"], 1772186460], // 2026-02-28 10:01:00
      [3, 0, ["חיפה - כרמל"], 1772186405], // 2026-02-28 10:00:05 (Same minute as #1)
    ];

    const mockCitiesMetadata = {
      "חיפה - כרמל": { id: 101, lat: 32.8, lng: 34.9 },
      "חיפה - מערב": { id: 102, lat: 32.7, lng: 34.8 },
      "תל אביב - יפו": { id: 201, lat: 32.0, lng: 34.7 },
    };

    const mockPolygonsRaw: Record<string, [number, number][]> = {
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
      mockRawAlarms,
      mockCitiesMetadata,
      mockPolygonsRaw,
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

    // Regional Splitting
    const mockRawAlarmsWithRegions: [number, number, string[], number][] = [
      [1, 0, ["חיפה - כרמל"], 1772186400], // North (Area 1)
      [2, 0, ["תל אביב - יפו"], 1772186460], // Center (Area 3 implicit or defined)
      [3, 0, ["אשקלון - צפון"], 1772186520], // South (Area 17)
    ];

    const mockCitiesMetadataWithAreas = {
      "חיפה - כרמל": { id: 101, lat: 32.8, lng: 34.9, area: 1 },
      "תל אביב - יפו": { id: 201, lat: 32.0, lng: 34.7, area: 3 },
      "אשקלון - צפון": { id: 301, lat: 31.6, lng: 34.5, area: 17 },
    };

    const regionalResult = processRawAlarms(
      mockRawAlarmsWithRegions,
      mockCitiesMetadataWithAreas,
      {},
      filterDateUnix,
    );

    expect(regionalResult.regions["צפון"].stats?.totalAlarms).toBe(1);
    expect(regionalResult.regions["מרכז"].stats?.totalAlarms).toBe(1);
    expect(regionalResult.regions["דרום"].stats?.totalAlarms).toBe(1);
  });

  it("should generate city daily trend correctly within specified range", () => {
    const alarms: Alarm[] = [
      { datetime: "2026-03-01 12:00:00", city: "אשקלון" },
      { datetime: "2026-03-01 12:01:00", city: "אשקלון" },
      { datetime: "2026-03-03 15:00:00", city: "אשקלון" },
    ];

    // Using a fixed "now" date to ensure stable test
    const now = "2026-03-05";
    const trend = getCityDailyTrend(alarms, now);

    // Range: 2026-02-28 to 2026-03-05
    expect(trend).toHaveLength(6);
    expect(trend.find((t) => t.date === "2026-03-01")?.count).toBe(2);
    expect(trend.find((t) => t.date === "2026-03-02")?.count).toBe(0);
    expect(trend.find((t) => t.date === "2026-03-03")?.count).toBe(1);
    expect(trend.find((t) => t.date === "2026-03-05")?.count).toBe(0);
  });

  it("should calculate last24hFreqHours correctly", () => {
    // Mock current time to a fixed value
    const fixedNow = 1772359200; // 2026-03-02 10:00:00
    const originalDateNow = Date.now;
    Date.now = () => fixedNow * 1000;

    const twentyFourHoursAgo = fixedNow - 24 * 60 * 60; // 1772272800

    const mockRawAlarms: [number, number, string[], number][] = [
      [1, 0, ["אשקלון"], twentyFourHoursAgo + 3600], // 1 hour after 24h window start
      [2, 0, ["אשקלון"], twentyFourHoursAgo + 7200], // 2 hours after 24h window start
      [3, 0, ["אשקלון"], twentyFourHoursAgo - 3600], // OUTSIDE: 1 hour before 24h window start
    ];

    const result = processRawAlarms(mockRawAlarms, { אשקלון: { id: 1, lat: 0, lng: 0 } }, {}, 0);

    // 2 alarms within last 24h. Freq = 24 / 2 = 12.0 hours.
    expect(result.cityMetrics["אשקלון"].last24hFreqHours).toBe(12);

    // Test city with NO alarms in last 24h
    const mockRawAlarmsNoRecent: [number, number, string[], number][] = [
      [1, 0, ["באר שבע"], twentyFourHoursAgo - 3600],
    ];
    const resultNoRecent = processRawAlarms(mockRawAlarmsNoRecent, { "באר שבע": { id: 2, lat: 0, lng: 0 } }, {}, 0);
    expect(resultNoRecent.cityMetrics["באר שבע"].last24hFreqHours).toBeNull();

    // Restore original Date.now
    Date.now = originalDateNow;
  });

  it("should generate city summary correctly", () => {
    const alarms: Alarm[] = [
      { datetime: "2026-03-01 12:00:00", city: "אשקלון" },
      { datetime: "2026-03-01 12:01:00", city: "אשקלון" },
    ];

    const summary = getCitySummary(alarms, "אשקלון");
    expect(summary.last24h).toBeDefined();
    expect(summary.summaryText).toContain("אשקלון");
    expect(summary.weeklyAvg).toBeGreaterThan(0);
  });
});
