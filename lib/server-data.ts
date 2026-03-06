//"use cache";
// import { cacheLife } from "next/cache";
import { headers } from "next/headers";
import { type DashboardData } from "./types";
import { processRawAlarms } from "./data";

const DATA_URL = "https://www.tzevaadom.co.il/static/historical/all.json";
const CITIES_URL = "https://www.tzevaadom.co.il/static/cities.json";
const POLYGONS_URL = "https://www.tzevaadom.co.il/static/polygons.json";

/**
 * Server-side data fetching - CACHING TEMPORARILY DISABLED FOR TESTING
 */
export async function getDashboardData(): Promise<DashboardData> {
  // cacheLife("minutes");

  // Force dynamic rendering to allow new Date() usage
  await headers();

  try {
    const filterDateUnix = new Date("2026-02-28T00:00:00").getTime() / 1000;
    const [alarmsRes, citiesRes, polygonsRes] = await Promise.all([
      fetch(DATA_URL, { cache: "no-store" }),
      fetch(CITIES_URL, { cache: "no-store" }),
      fetch(POLYGONS_URL, { cache: "no-store" }),
    ]);

    if (!alarmsRes.ok || !citiesRes.ok || !polygonsRes.ok) {
      throw new Error("Failed to fetch data from source");
    }

    const rawAlarms = await alarmsRes.json();
    const citiesMetadata = (await citiesRes.json()).cities;
    const polygonsRaw = await polygonsRes.json();

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
      lastSirenPerCity: {},
      polygons: {},
      stats: null,
      topCities: [],
      mapData: [],
      globalDailyTrend: [],
      citiesList: [],
      lastUpdated: "שגיאת התחברות - נתונים שמורים עשויים להיות מוצגים",
      isFallback: true,
    };
  }
}
