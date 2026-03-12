import { headers } from "next/headers";
import { type DashboardData } from "@/lib/types";
import { processRawAlarms, getUnixForIsraelDate, OPERATION_START } from "@/lib/utils/data-processor";
import fs from "fs";
import path from "path";

const DATA_URL = "https://www.tzevaadom.co.il/static/historical/all.json";
const CITIES_PATH = path.join(process.cwd(), "lib/data/cities.json");
const POLYGONS_PATH = path.join(process.cwd(), "lib/data/polygons.json");

/**
 * Server-side data fetching service.
 */
export async function getDashboardData(): Promise<DashboardData> {
  // Force dynamic rendering to allow new Date() usage
  await headers();

  try {
    // Dynamically calculate the Unix timestamp for the start of the operation in Israel Time
    const filterDateUnix = getUnixForIsraelDate(OPERATION_START);

    // Load static data from local disk
    const citiesMetadata = JSON.parse(
      fs.readFileSync(CITIES_PATH, "utf8"),
    ).cities;
    const polygonsRaw = JSON.parse(fs.readFileSync(POLYGONS_PATH, "utf8"));

    // Fetch dynamic alarms from source with cache-busting and browser-like headers
    const alarmsRes = await fetch(`${DATA_URL}?t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.tzevaadom.co.il/",
        Origin: "https://www.tzevaadom.co.il",
      },
    });

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
    // Return a minimal fallback object
    return {
      alarms: [],
      alarmsByCity: {},
      cityMetrics: {},
      lastSirenPerCity: {},
      polygons: {},
      stats: null,
      topCities: [],
      bottomCities: [],
      mapData: [],
      globalDailyTrend: [],
      hourlyDistribution: [],
      citiesList: [],
      regions: {},
      lastUpdated: "שגיאת התחברות - נתונים שמורים עשויים להיות מוצגים",
      isFallback: true,
    };
  }
}
