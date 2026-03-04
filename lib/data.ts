import { getCoordinatesForCity } from './geodata';

export interface Alarm {
  datetime: string;
  city: string;
}

export interface MapData {
  city: string;
  count: number;
  lat: number;
  lon: number;
}

// JSON Structure: [group_id, threat_id, [cities], unix_timestamp]
type RawAlarmEntry = [number, number, string[], number];

const DATA_URL = 'https://www.tzevaadom.co.il/static/historical/all.json';
const FILTER_DATE_UNIX = new Date('2026-02-28T00:00:00').getTime() / 1000;
const CACHE_KEY = 'alarms_cache_v2'; // Changed version to invalidate old CSV cache
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function fetchAlarms(): Promise<Alarm[]> {
  // Try to load from cache
  if (typeof window !== 'undefined') {
    const cachedData = sessionStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const { timestamp, data } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      } catch (e) {
        // ignore error
      }
    }
  }

  const response = await fetch(DATA_URL);
  const data: RawAlarmEntry[] = await response.json();

  const uniqueAlarms = new Set<string>();
  const alarms: Alarm[] = [];

  // Sort by timestamp ascending for consistent display if needed
  data.sort((a, b) => a[3] - b[3]);

  data.forEach(([, , cities, timestamp]) => {
    if (timestamp < FILTER_DATE_UNIX) return;

    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const datetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    cities.forEach((city) => {
      const normalizedCity = normalizeCityName(city);
      const key = `${normalizedCity}|${datetime}`;

      if (!uniqueAlarms.has(key)) {
        uniqueAlarms.add(key);
        alarms.push({
          datetime,
          city: normalizedCity,
        });
      }
    });
  });

  // Save to cache
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: alarms
      }));
    } catch (e) {
      // ignore
    }
  }

  return alarms;
}

export function normalizeCityName(city: string): string {
  // Simple fix: Split at the first hyphen and trim.
  // This handles "אשדוד - יא...", "באר שבע - מזרח", and "תל אביב - יפו" consistently.
  return city.split('-')[0].trim();
}

export function getUniqueCities(alarms: Alarm[]): string[] {
  const cities = new Set<string>();
  for (let i = 0; i < alarms.length; i++) {
    cities.add(alarms[i].city);
  }
  return Array.from(cities).sort((a, b) => a.localeCompare(b, 'he'));
}

export function getHourlyDistribution(alarms: Alarm[], cityName: string) {
  const hourlyCounts = Array(24).fill(0);
  const normalizedSearchName = normalizeCityName(cityName);
  
  for (let i = 0; i < alarms.length; i++) {
    const alarm = alarms[i];
    if (alarm.city === normalizedSearchName) {
      const timePart = alarm.datetime.split(' ')[1];
      const hour = parseInt(timePart.split(':')[0], 10);
      if (hour >= 0 && hour < 24) {
        hourlyCounts[hour]++;
      }
    }
  }

  return hourlyCounts.map((count, hour) => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    count,
  }));
}

export function getDailyTrend(alarms: Alarm[], cityName?: string) {
  const dailyCounts: Record<string, number> = {};
  const normalizedSearchName = cityName ? normalizeCityName(cityName) : null;
  
  for (let i = 0; i < alarms.length; i++) {
    const alarm = alarms[i];
    if (!normalizedSearchName || alarm.city === normalizedSearchName) {
      const datePart = alarm.datetime.includes(' ') ? alarm.datetime.split(' ')[0] : alarm.datetime;
      dailyCounts[datePart] = (dailyCounts[datePart] || 0) + 1;
    }
  }

  return Object.entries(dailyCounts)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, count]) => ({
      date,
      count,
    }));
}

export function getGlobalStats(alarms: Alarm[]) {
  if (alarms.length === 0) return null;

  const totalAlarms = alarms.length;
  const cityCounts: Record<string, number> = {};
  const uniqueBaseCities = new Set<string>();

  alarms.forEach(a => {
    uniqueBaseCities.add(a.city);
    cityCounts[a.city] = (cityCounts[a.city] || 0) + 1;
  });
  
  const topCity = Object.entries(cityCounts)
    .sort(([, a], [, b]) => b - a)[0];

  const dates = alarms.map(a => a.datetime.split(' ')[0]);
  const uniqueDays = new Set(dates);
  
  return {
    totalAlarms,
    topCityName: topCity?.[0] || 'N/A',
    topCityCount: topCity?.[1] || 0,
    activeDays: uniqueDays.size,
    affectedCitiesCount: uniqueBaseCities.size
  };
}

export function getTopCities(alarms: Alarm[], limit: number = 5) {
  const cityCounts: Record<string, number> = {};
  
  alarms.forEach(a => {
    cityCounts[a.city] = (cityCounts[a.city] || 0) + 1;
  });

  return Object.entries(cityCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export function getMapData(alarms: Alarm[]): MapData[] {
  const cityCounts: Record<string, number> = {};
  
  alarms.forEach(a => {
    cityCounts[a.city] = (cityCounts[a.city] || 0) + 1;
  });

  const mapData: MapData[] = [];
  
  Object.entries(cityCounts).forEach(([city, count]) => {
    const coords = getCoordinatesForCity(city);
    if (coords) {
      mapData.push({
        city,
        count,
        lat: coords.lat,
        lon: coords.lon
      });
    }
  });

  return mapData;
}
