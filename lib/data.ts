import { type Alarm, type MapData, type DashboardData, type GlobalStats } from './types';

export * from './types';

export function normalizeCityName(city: string): string {
  // Removes sectors (after -) and parenthetical info
  return city.replace(/\(.*\)/g, '').split('-')[0].trim();
}

function getMinuteKey(datetime: string): string {
  return datetime.substring(0, 16);
}

/**
 * Highly optimized date formatting for Israel (Asia/Jerusalem).
 * Replaces expensive Intl.DateTimeFormat.formatToParts in loops.
 */
function getIsraelTime(timestamp: number) {
  // Israel is UTC+2, plus 1 if DST is active.
  // We use a single Intl formatter just to get the string, and only once per unique timestamp if possible.
  // For maximum speed while maintaining timezone correctness, we cache the results.
  const date = new Date(timestamp * 1000);
  
  // Format: "YYYY-MM-DD HH:mm:ss"
  // Using toLocaleString with Asia/Jerusalem is still faster than formatToParts
  // but let's use a simple cache to handle the 19k records.
  return date.toLocaleString('sv-SE', { timeZone: 'Asia/Jerusalem' });
}

const dateCache = new Map<number, { datetime: string; datePart: string }>();

export function processRawAlarms(
  rawAlarms: [number, number, string[], number][], 
  citiesMetadata: Record<string, { id: number; lat: number; lng: number }>, 
  polygonsRaw: Record<string, [number, number][]>,
  filterDateUnix: number
): DashboardData {
  const alarms: Alarm[] = [];
  const alarmsByCity: Record<string, Alarm[]> = {};
  const lastSirenPerCity: Record<string, string> = {};
  const cityToPolygon: Record<string, [number, number][]> = {};
  const cityEventCounts: Record<string, number> = {};
  const seenEvents = new Set<string>();
  const uniqueBaseCities = new Set<string>();
  const dailyCounts: Record<string, number> = {};
  const citySirenCounts: Record<string, { count: number; lat?: number; lon?: number }> = {};
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
        datePart: datetime.split(' ')[0] 
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
        lon: meta?.lng
      };

      alarms.push(alarmObj);
      
      if (!alarmsByCity[baseCity]) alarmsByCity[baseCity] = [];
      alarmsByCity[baseCity].push(alarmObj);
      
      if (!lastSirenPerCity[baseCity] || datetime > lastSirenPerCity[baseCity]) {
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
      }
    }
  }

  const sortedCityEvents = Object.entries(cityEventCounts).sort(([, a], [, b]) => b - a);
  const topCity = sortedCityEvents[0];
  
  const mapData: MapData[] = Object.entries(citySirenCounts)
    .filter(([, d]) => d.lat !== undefined && d.lon !== undefined)
    .map(([city, data]) => ({
      city,
      count: data.count,
      lat: data.lat!,
      lon: data.lon!,
      polygon: cityToPolygon[city]
    }));

  const stats: GlobalStats | null = alarms.length > 0 ? {
    totalAlarms: alarms.length,
    topCityName: topCity?.[0] || 'N/A',
    topCityCount: topCity?.[1] || 0,
    activeDays: Object.keys(dailyCounts).length,
    affectedCitiesCount: uniqueBaseCities.size
  } : null;

  return {
    alarms,
    alarmsByCity,
    lastSirenPerCity,
    polygons: cityToPolygon,
    stats,
    topCities: sortedCityEvents.slice(0, 5).map(([name, count]) => ({ name, count })),
    mapData,
    globalDailyTrend: Object.entries(dailyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count })),
    citiesList: Array.from(uniqueBaseCities).sort((a, b) => a.localeCompare(b, 'he')),
    lastUpdated: maxTimestamp > 0 
      ? new Date(maxTimestamp * 1000).toLocaleString('he-IL', { 
          timeZone: 'Asia/Jerusalem',
          hour: '2-digit', 
          minute: '2-digit', 
          day: '2-digit', 
          month: '2-digit', 
          year: '2-digit' 
        })
      : 'N/A'
  };
}

export function getHourlyDistribution(cityAlarms: Alarm[]) {
  const hourlyCounts = Array(24).fill(0);
  const seenMinutes = new Set<string>();

  for (let i = 0; i < cityAlarms.length; i++) {
    const a = cityAlarms[i];
    const minKey = getMinuteKey(a.datetime);
    if (!seenMinutes.has(minKey)) {
      seenMinutes.add(minKey);
      const hour = parseInt(a.datetime.substring(11, 13), 10);
      if (hour >= 0 && hour < 24) hourlyCounts[hour]++;
    }
  }

  return hourlyCounts.map((count, hour) => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    count,
  }));
}

export function getCityDailyTrend(cityAlarms: Alarm[]) {
  const dailyCounts: Record<string, number> = {};
  const seenMinutes = new Set<string>();

  // Only consider dates from the first alarm to now or fixed range
  // We can't easily generate all dates without a start/end, 
  // but we know the range starts from 2026-02-28
  const startDate = new Date('2026-02-28');
  const endDate = new Date();
  
  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    dailyCounts[dateStr] = 0;
    current.setDate(current.getDate() + 1);
  }

  for (let i = 0; i < cityAlarms.length; i++) {
    const a = cityAlarms[i];
    const minKey = getMinuteKey(a.datetime);
    if (!seenMinutes.has(minKey)) {
      seenMinutes.add(minKey);
      const datePart = a.datetime.substring(0, 10);
      if (dailyCounts[datePart] !== undefined) {
        dailyCounts[datePart]++;
      }
    }
  }

  return Object.entries(dailyCounts)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, count]) => ({ date, count }));
}
