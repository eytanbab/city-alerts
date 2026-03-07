import {
  type Alarm,
  type MapData,
  type DashboardData,
  type GlobalStats,
  type CityMetrics,
} from "./types";

export * from "./types";

export function normalizeCityName(city: string): string {
  // Removes sectors (after -) and parentheses
  let name = city.split("-")[0].trim();
  name = name.split("(")[0].trim();
  return name;
}

const dateCache = new Map<number, { datetime: string; datePart: string }>();

export function getIsraelTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString("en-CA", {
    timeZone: "Asia/Jerusalem",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).replace(/,/g, "");
}

export function getHourlyDistribution(alarms: Alarm[]): { hour: string; count: number }[] {
  const hourlyCounts: Record<string, Set<string>> = {};
  for (let i = 0; i < 24; i++) {
    hourlyCounts[`${i.toString().padStart(2, "0")}:00`] = new Set();
  }

  for (const alarm of alarms) {
    const parts = alarm.datetime.split(" ");
    const datePart = parts[0];
    const timePart = parts[1];
    const hourPart = timePart.substring(0, 2);
    const minPart = timePart.substring(3, 5);
    const hourKey = `${hourPart}:00`;
    
    // Aggregation: count unique city+date+minute events
    const baseCity = normalizeCityName(alarm.city);
    const eventKey = `${baseCity}|${datePart}|${hourPart}:${minPart}`;
    if (hourlyCounts[hourKey]) {
      hourlyCounts[hourKey].add(eventKey);
    }
  }

  return Object.entries(hourlyCounts).map(([hour, events]) => ({
    hour,
    count: events.size,
  }));
}

export function processRawAlarms(
  rawAlarms: [number, number, string[], number][],
  citiesMetadata: Record<string, { id: number; lat: number; lng: number; area?: number }>,
  polygonsRaw: Record<string, [number, number][]>,
  filterDateUnix: number,
): DashboardData {
  const alarms: Alarm[] = [];
  const alarmsByCity: Record<string, Alarm[]> = {};
  const lastSirenPerCity: Record<string, string> = {};
  const cityToPolygon: Record<string, [number, number][]> = {};
  const cityEventCounts: Record<string, number> = {};
  const cityEventTimestamps: Record<string, number[]> = {};
  const seenEvents = new Set<string>();
  const uniqueBaseCities = new Set<string>();
  const dailyCounts: Record<string, number> = {};
  const citySirenCounts: Record<
    string,
    { count: number; lat?: number; lon?: number }
  > = {};
  let maxTimestamp = 0;

  // Clear cache for new data processing batch
  dateCache.clear();

  // Process in a single pass
  for (let i = 0; i < rawAlarms.length; i++) {
    const [, , cities, timestamp] = rawAlarms[i];
    if (timestamp < filterDateUnix) continue;

    if (timestamp > maxTimestamp) maxTimestamp = timestamp;

    let dateInfo = dateCache.get(timestamp);
    if (!dateInfo) {
      const datetime = getIsraelTime(timestamp);
      dateInfo = {
        datetime,
        datePart: datetime.split(" ")[0],
      };
      dateCache.set(timestamp, dateInfo);
    }

    const { datetime, datePart } = dateInfo;
    const minKey = datetime.substring(0, 16);

    for (let j = 0; j < cities.length; j++) {
      const city = cities[j].trim();
      const baseCity = normalizeCityName(city);
      const meta = citiesMetadata[city];

      const alarmObj: Alarm = {
        datetime,
        city,
        lat: meta?.lat,
        lon: meta?.lng,
      };

      alarms.push(alarmObj);

      if (!alarmsByCity[baseCity]) alarmsByCity[baseCity] = [];
      alarmsByCity[baseCity].push(alarmObj);

      if (
        !lastSirenPerCity[baseCity] ||
        datetime > lastSirenPerCity[baseCity]
      ) {
        lastSirenPerCity[baseCity] = datetime;
      }

      if (meta?.id && polygonsRaw[meta.id] && !cityToPolygon[city]) {
        cityToPolygon[city] = polygonsRaw[meta.id];
      }

      if (!citySirenCounts[city]) {
        citySirenCounts[city] = { count: 0, lat: meta?.lat, lon: meta?.lng };
      }
      citySirenCounts[city].count++;

      uniqueBaseCities.add(baseCity);
      const eventKey = `${baseCity}|${minKey}`;
      if (!seenEvents.has(eventKey)) {
        seenEvents.add(eventKey);
        cityEventCounts[baseCity] = (cityEventCounts[baseCity] || 0) + 1;
        dailyCounts[datePart] = (dailyCounts[datePart] || 0) + 1;

        if (!cityEventTimestamps[baseCity]) cityEventTimestamps[baseCity] = [];
        cityEventTimestamps[baseCity].push(timestamp);
      }
    }
  }

  const cityMetrics: Record<string, CityMetrics> = {};
  const now = Math.floor(Date.now() / 1000);

  for (const [baseCity, timestamps] of Object.entries(cityEventTimestamps)) {
    const sorted = timestamps.sort((a, b) => a - b);
    let totalGap = 0;
    let maxGap = 0;
    let peakIntensity = 0;

    for (let k = 1; k < sorted.length; k++) {
      const gap = sorted[k] - sorted[k - 1];
      totalGap += gap;
      if (gap > maxGap) maxGap = gap;
    }

    const endTimestamp = Math.min(now, maxTimestamp);
    const lastGap = endTimestamp - sorted[sorted.length - 1];
    if (lastGap > maxGap) maxGap = lastGap;

    let left = 0;
    for (let right = 0; right < sorted.length; right++) {
      while (sorted[right] - sorted[left] > 600) {
        left++;
      }
      const count = right - left + 1;
      if (count > peakIntensity) peakIntensity = count;
    }

    cityMetrics[baseCity] = {
      avgQuietTimeHours:
        sorted.length > 1 ? totalGap / (sorted.length - 1) / 3600 : 0,
      maxQuietTimeHours: maxGap / 3600,
      peakIntensity10Min: peakIntensity,
      totalEvents: sorted.length,
    };
  }

  const sortedCityEvents = Object.entries(cityEventCounts).sort(
    ([, a], [, b]) => b - a,
  );
  const topCity = sortedCityEvents[0];

  const mapData: MapData[] = Object.entries(citySirenCounts)
    .filter(([, d]) => d.lat !== undefined && d.lon !== undefined)
    .map(([city, data]) => ({
      city,
      count: data.count,
      lat: data.lat!,
      lon: data.lon!,
      polygon: cityToPolygon[city],
    }));

  const stats: GlobalStats | null =
    alarms.length > 0
      ? {
          totalAlarms: alarms.length,
          topCityName: topCity?.[0] || "N/A",
          topCityCount: topCity?.[1] || 0,
          statsDate: new Date(maxTimestamp * 1000).toLocaleDateString("he-IL"),
          activeDays: Object.keys(dailyCounts).length,
          affectedCitiesCount: uniqueBaseCities.size,
        }
      : null;

  return {
    alarms,
    alarmsByCity,
    cityMetrics,
    lastSirenPerCity,
    polygons: cityToPolygon,
    stats,
    topCities: sortedCityEvents
      .slice(0, 5)
      .map(([name, count]) => ({ name, count })),
    mapData,
    globalDailyTrend: Object.entries(dailyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count })),
    citiesList: Array.from(uniqueBaseCities).sort((a, b) =>
      a.localeCompare(b, "he"),
    ),
    lastUpdated:
      maxTimestamp > 0
        ? new Date(maxTimestamp * 1000).toLocaleString("he-IL", {
            timeZone: "Asia/Jerusalem",
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })
        : "N/A",
  };
}

export function getCityDailyTrend(alarms: Alarm[], nowStr?: string): { date: string; count: number }[] {
  const dailyCounts: Record<string, Set<string>> = {};
  const startDate = new Date("2026-02-28T00:00:00");
  
  // Parse nowStr as local date part to avoid UTC issues
  let endDate: Date;
  if (nowStr) {
    const [y, m, d] = nowStr.split("-").map(Number);
    endDate = new Date(y, m - 1, d);
  } else {
    endDate = new Date();
  }
  
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  while (current <= end) {
    const y = current.getFullYear();
    const m = (current.getMonth() + 1).toString().padStart(2, "0");
    const d = current.getDate().toString().padStart(2, "0");
    const datePart = `${y}-${m}-${d}`;
    dailyCounts[datePart] = new Set();
    current.setDate(current.getDate() + 1);
  }

  for (const alarm of alarms) {
    const parts = alarm.datetime.split(" ");
    const datePart = parts[0];
    const timePart = parts[1].substring(0, 5); // HH:mm
    const baseCity = normalizeCityName(alarm.city);
    const eventKey = `${baseCity}|${timePart}`;
    
    if (dailyCounts[datePart]) {
      dailyCounts[datePart].add(eventKey);
    }
  }

  return Object.entries(dailyCounts)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, events]) => ({ date, count: events.size }));
}
