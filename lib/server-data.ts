//"use cache";
// import { cacheLife } from "next/cache";
import { headers } from "next/headers";
import { type DashboardData } from "./types";
import { processRawAlarms } from "./data";
import fs from "fs";
import path from "path";

const DATA_URL = "https://www.tzevaadom.co.il/static/historical/all.json";
const CITIES_PATH = path.join(process.cwd(), "lib/data/cities.json");
const POLYGONS_PATH = path.join(process.cwd(), "lib/data/polygons.json");

/**
 * Server-side data fetching - CACHING TEMPORARILY DISABLED FOR TESTING
 */
export async function getDashboardData(): Promise<DashboardData> {
  // cacheLife("minutes");

  // Force dynamic rendering to allow new Date() usage
  await headers();

  try {
    const filterDateUnix = new Date("2026-02-28T00:00:00").getTime() / 1000;

    // Load static data from local disk
    const citiesMetadata = JSON.parse(fs.readFileSync(CITIES_PATH, "utf8")).cities;
    const polygonsRaw = JSON.parse(fs.readFileSync(POLYGONS_PATH, "utf8"));

    // Fetch dynamic alarms from source
    const alarmsRes = await fetch(DATA_URL, { cache: "no-store" });

    if (!alarmsRes.ok) {
      throw new Error("Failed to fetch alarms from source");
    }

    const rawAlarms = await alarmsRes.json();

    const result = processRawAlarms(
      rawAlarms,
      citiesMetadata,
      polygonsRaw,
      filterDateUnix,
    );

    const lastSync = new Date().toLocaleString("he-IL", {
      timeZone: "Asia/Jerusalem",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return {
      ...result,
      lastSync,
    };
  } catch (error) {
    console.error("Data fetch error:", error);
    // Return a minimal fallback object that OverviewContent can handle
    return {
      alarms: [],
      alarmsByCity: {},
      cityMetrics: {},
      lastSirenPerCity: {},
      polygons: {},
      stats: null,
      topCities: [],
      mapData: [],
      globalDailyTrend: [],
      citiesList: [],
      regions: {},
      lastUpdated: "שגיאת התחברות - נתונים שמורים עשויים להיות מוצגים",
      isFallback: true,
    };
  }
}
