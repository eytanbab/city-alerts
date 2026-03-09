import {
  type Alarm,
  type MapData,
  type DashboardData,
  type GlobalStats,
  type CityMetrics,
  type RegionStats,
} from "@/lib/types";

export function getRegionForArea(area?: number): string {
  if (area === undefined) return "מרכז";
  // North: Galilee, Golan, Haifa, Valley, etc.
  const north = [1, 4, 6, 10, 15, 16, 19, 22, 25, 27, 28, 33, 34, 35, 36];
  // South: Negev, Arava, Gaza, Lakhish
  const south = [2, 7, 12, 13, 14, 17, 21, 24, 26];

  if (north.includes(area)) return "צפון";
  if (south.includes(area)) return "דרום";
  return "מרכז";
}

export function normalizeCityName(city: string): string {
  // Removes sectors (after -) and parentheses
  let name = city.split("-")[0].trim();
  name = name.split("(")[0].trim();
  return name;
}

const dateCache = new Map<number, { datetime: string; datePart: string }>();

export function getIsraelTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date
    .toLocaleString("en-CA", {
      timeZone: "Asia/Jerusalem",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    .replace(/,/g, "");
}

export function getHourlyDistribution(
  alarms: Alarm[],
): { hour: string; count: number }[] {
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
  citiesMetadata: Record<
    string,
    { id: number; lat: number; lng: number; area?: number }
  >,
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

  // Regional trackers
  const regionsList = ["צפון", "מרכז", "דרום"];
  const regionalAlarms: Record<string, Alarm[]> = {
    צפון: [],
    מרכז: [],
    דרום: [],
  };
  const regionalDailyCounts: Record<string, Record<string, number>> = {
    צפון: {},
    מרכז: {},
    דרום: {},
  };
  regionsList.forEach((r) => (regionalDailyCounts[r] = {}));

  const regionalCityEventCounts: Record<string, Record<string, number>> = {};
  regionsList.forEach((r) => (regionalCityEventCounts[r] = {}));

  const regionalCitySirenCounts: Record<
    string,
    Record<string, { count: number; lat?: number; lon?: number }>
  > = {};
  regionsList.forEach((r) => (regionalCitySirenCounts[r] = {}));

  const regionalUniqueCities: Record<string, Set<string>> = {};
  regionsList.forEach((r) => (regionalUniqueCities[r] = new Set()));

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
      const region = getRegionForArea(meta?.area);

      const alarmObj: Alarm = {
        datetime,
        city,
        lat: meta?.lat,
        lon: meta?.lng,
      };

      alarms.push(alarmObj);
      regionalAlarms[region].push(alarmObj);

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

      if (!regionalCitySirenCounts[region][city]) {
        regionalCitySirenCounts[region][city] = {
          count: 0,
          lat: meta?.lat,
          lon: meta?.lng,
        };
      }
      regionalCitySirenCounts[region][city].count++;

      uniqueBaseCities.add(baseCity);
      regionalUniqueCities[region].add(baseCity);

      const eventKey = `${baseCity}|${minKey}`;
      if (!seenEvents.has(eventKey)) {
        seenEvents.add(eventKey);
        cityEventCounts[baseCity] = (cityEventCounts[baseCity] || 0) + 1;
        dailyCounts[datePart] = (dailyCounts[datePart] || 0) + 1;

        regionalCityEventCounts[region][baseCity] =
          (regionalCityEventCounts[region][baseCity] || 0) + 1;
        regionalDailyCounts[region][datePart] =
          (regionalDailyCounts[region][datePart] || 0) + 1;

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

  const statsDate =
    maxTimestamp > 0
      ? new Date(maxTimestamp * 1000).toLocaleDateString("he-IL")
      : undefined;

  const stats: GlobalStats | null =
    alarms.length > 0
      ? {
          totalAlarms: alarms.length,
          topCityName: topCity?.[0] || "N/A",
          topCityCount: topCity?.[1] || 0,
          statsDate,
          activeDays: Object.keys(dailyCounts).length,
          affectedCitiesCount: uniqueBaseCities.size,
        }
      : null;

  // Build regional results
  const regions: Record<string, RegionStats> = {};
  for (const region of regionsList) {
    const rSortedCityEvents = Object.entries(
      regionalCityEventCounts[region],
    ).sort(([, a], [, b]) => b - a);
    const rTopCity = rSortedCityEvents[0];

    const rMapData: MapData[] = Object.entries(regionalCitySirenCounts[region])
      .filter(([, d]) => d.lat !== undefined && d.lon !== undefined)
      .map(([city, data]) => ({
        city,
        count: data.count,
        lat: data.lat!,
        lon: data.lon!,
        polygon: cityToPolygon[city],
      }));

    regions[region] = {
      stats:
        regionalAlarms[region].length > 0
          ? {
              totalAlarms: regionalAlarms[region].length,
              topCityName: rTopCity?.[0] || "N/A",
              topCityCount: rTopCity?.[1] || 0,
              statsDate,
              activeDays: Object.keys(regionalDailyCounts[region]).length,
              affectedCitiesCount: regionalUniqueCities[region].size,
            }
          : null,
      topCities: rSortedCityEvents
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })),
      mapData: rMapData,
      globalDailyTrend: Object.entries(regionalDailyCounts[region])
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count })),
    };
  }

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
    regions,
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

export function getCityDailyTrend(
  alarms: Alarm[],
  nowStr?: string,
): { date: string; count: number }[] {
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

  const current = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
  );
  const end = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  );

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

export interface CitySummaryData {
  last24h: number;
  prev24h: number;
  percentChange: number | null;
  weeklyAvg: number;
  summaryText: string;
  longestQuietStreakDays: number;
  isPeakIntensity: boolean;
}

export function getCitySummary(alarms: Alarm[], city: string): CitySummaryData {
  const now = Math.max(
    ...alarms.map((a) => new Date(a.datetime).getTime()),
    Date.now() - 86400000,
  );
  const oneDayMs = 24 * 60 * 60 * 1000;
  const last24hStart = now - oneDayMs;
  const prev24hStart = now - 2 * oneDayMs;

  const getUniqueEventsInRange = (start: number, end: number) => {
    const seen = new Set<string>();
    alarms.forEach((a) => {
      const ts = new Date(a.datetime).getTime();
      if (ts >= start && ts < end) {
        const minKey = a.datetime.substring(0, 16);
        seen.add(`${normalizeCityName(a.city)}|${minKey}`);
      }
    });
    return seen.size;
  };

  const last24h = getUniqueEventsInRange(last24hStart, now);
  const prev24h = getUniqueEventsInRange(prev24hStart, last24hStart);

  // Advanced Metric: Longest Quiet Streak in the filtered data
  const dates = Array.from(
    new Set(alarms.map((a) => a.datetime.split(" ")[0])),
  ).sort();
  let maxStreak = 0;
  if (dates.length > 1) {
    for (let i = 1; i < dates.length; i++) {
      const d1 = new Date(dates[i - 1]);
      const d2 = new Date(dates[i]);
      const diffDays = Math.floor((d2.getTime() - d1.getTime()) / oneDayMs);
      if (diffDays > maxStreak) maxStreak = diffDays;
    }
  }

  // Advanced Metric: Peak Intensity (is today higher than 90% of other days?)
  const dailyCounts: Record<string, number> = {};
  alarms.forEach((a) => {
    const d = a.datetime.split(" ")[0];
    if (!dailyCounts[d]) dailyCounts[d] = 0;
    // This is a rough approximation for peak
    dailyCounts[d]++;
  });
  const sortedCounts = Object.values(dailyCounts).sort((a, b) => a - b);
  const threshold = sortedCounts[Math.floor(sortedCounts.length * 0.9)] || 0;
  const isPeakIntensity = last24h > threshold && last24h > 0;

  let percentChange: number | null = null;
  if (prev24h > 0) {
    percentChange = Math.round(((last24h - prev24h) / prev24h) * 100);
  } else if (last24h > 0) {
    percentChange = 100;
  }

  const daysWithAlarms = new Set(alarms.map((a) => a.datetime.split(" ")[0]))
    .size;
  const totalUniqueEvents = new Set(
    alarms.map(
      (a) => `${normalizeCityName(a.city)}|${a.datetime.substring(0, 16)}`,
    ),
  ).size;
  const weeklyAvg = daysWithAlarms > 0 ? totalUniqueEvents / daysWithAlarms : 0;

  let summaryText = "";
  const cityName = normalizeCityName(city);

  if (last24h === 0) {
    summaryText = `השקט נשמר ב${cityName} ב-24 השעות האחרונות. `;
    if (prev24h > 0) {
      summaryText += `זוהי רגיעה מבורכת לאחר ${prev24h} אזעקות ביום הקודם. `;
    }
    if (maxStreak > 1) {
      summaryText += `שיא השקט המתועד ביישוב עומד על ${maxStreak} ימים רצופים.`;
    }
  } else {
    summaryText = `במהלך היממה האחרונה, ${cityName} חוותה ${last24h} סבבי אזעקות. `;

    if (isPeakIntensity) {
      summaryText += `זהו יום אינטנסיבי במיוחד, שנמצא בטווח ה-10% העליונים של רמת הפעילות ההיסטורית ביישוב. `;
    }

    if (percentChange !== null && Math.abs(percentChange) > 10) {
      const trend = percentChange > 0 ? "עלייה" : "ירידה";
      summaryText += `נרשמה ${trend} של ${Math.abs(percentChange)}% בעצימות לעומת אתמול. `;
    }

    if (last24h > weeklyAvg) {
      summaryText += `רמת הפעילות כעת גבוהה מהממוצע השבועי שעומד על ${weeklyAvg.toFixed(1)} אזעקות ליום.`;
    }
  }

  return {
    last24h,
    prev24h,
    percentChange,
    weeklyAvg,
    summaryText,
    longestQuietStreakDays: maxStreak,
    isPeakIntensity,
  };
}
