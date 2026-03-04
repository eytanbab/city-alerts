export interface Alarm {
  datetime: string;
  city: string;
  lat?: number;
  lon?: number;
}

export interface MapData {
  city: string;
  count: number;
  lat: number;
  lon: number;
  polygon?: [number, number][];
}

type RawAlarmEntry = [number, number, string[], number];
interface RawCityMetadata {
  id: number;
  lat: number;
  lng: number;
  [key: string]: any;
}

const DATA_URL = '/api/alarms';
const FILTER_DATE_UNIX = new Date('2026-02-28T00:00:00').getTime() / 1000;
const CACHE_KEY = 'alarms_cache_v8'; 
const CACHE_DURATION = 10 * 60 * 1000;

export async function fetchAlarms(): Promise<{ alarms: Alarm[], polygons: Record<string, [number, number][]> }> {
  if (typeof window !== 'undefined') {
    const cachedData = sessionStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const { timestamp, data } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) return data;
      } catch (e) {}
    }
  }

  const response = await fetch(DATA_URL);
  const json = await response.json();
  const rawAlarms: RawAlarmEntry[] = json.alarms;
  const citiesMetadata: Record<string, RawCityMetadata> = json.cities;
  const polygonsRaw: Record<string, [number, number][]> = json.polygons;
  
  const alarms: Alarm[] = [];
  const cityToPolygon: Record<string, [number, number][]> = {};

  rawAlarms.forEach(([, , cities, timestamp]) => {
    if (timestamp < FILTER_DATE_UNIX) return;

    const date = new Date(timestamp * 1000);
    const datetime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;

    cities.forEach((cityName) => {
      const city = cityName.trim();
      const meta = citiesMetadata[city];
      
      alarms.push({
        datetime,
        city,
        lat: meta?.lat,
        lon: meta?.lng
      });

      if (meta?.id && polygonsRaw[meta.id] && !cityToPolygon[city]) {
        cityToPolygon[city] = polygonsRaw[meta.id];
      }
    });
  });

  alarms.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  const result = { alarms, polygons: cityToPolygon };

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: result
      }));
    } catch (e) {}
  }

  return result;
}

export function normalizeCityName(city: string): string {
  return city.replace(/\(.*\)/g, '').split('-')[0].trim();
}

function getMinuteKey(datetime: string): string {
  return datetime.substring(0, 16);
}

export function getUniqueCities(alarms: Alarm[]): string[] {
  const cities = new Set<string>();
  alarms.forEach(a => cities.add(normalizeCityName(a.city)));
  return Array.from(cities).sort((a, b) => a.localeCompare(b, 'he'));
}

export function getHourlyDistribution(alarms: Alarm[], cityName: string) {
  const hourlyCounts = Array(24).fill(0);
  const normalizedTarget = normalizeCityName(cityName);
  const seenMinutes = new Set<string>();

  alarms.forEach(a => {
    if (normalizeCityName(a.city) === normalizedTarget) {
      const minKey = getMinuteKey(a.datetime);
      if (!seenMinutes.has(minKey)) {
        seenMinutes.add(minKey);
        const hour = parseInt(a.datetime.split(' ')[1].split(':')[0], 10);
        if (hour >= 0 && hour < 24) hourlyCounts[hour]++;
      }
    }
  });

  return hourlyCounts.map((count, hour) => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    count,
  }));
}

export function getDailyTrend(alarms: Alarm[], cityName?: string) {
  const dailyCounts: Record<string, number> = {};
  const normalizedTarget = cityName ? normalizeCityName(cityName) : null;
  const seenEvents = new Set<string>();

  alarms.forEach(a => {
    const baseCity = normalizeCityName(a.city);
    const minKey = getMinuteKey(a.datetime);
    const eventKey = `${baseCity}|${minKey}`;
    
    if (!normalizedTarget || baseCity === normalizedTarget) {
      if (!seenEvents.has(eventKey)) {
        seenEvents.add(eventKey);
        const datePart = a.datetime.split(' ')[0];
        dailyCounts[datePart] = (dailyCounts[datePart] || 0) + 1;
      }
    }
  });

  return Object.entries(dailyCounts)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, count]) => ({ date, count }));
}

export function getGlobalStats(alarms: Alarm[]) {
  if (alarms.length === 0) return null;
  
  const totalSirens = alarms.length; 
  const cityEventCounts: Record<string, number> = {};
  const seenEvents = new Set<string>();
  const uniqueBaseCities = new Set<string>();

  alarms.forEach(a => {
    const baseCity = normalizeCityName(a.city);
    uniqueBaseCities.add(baseCity);
    const minKey = getMinuteKey(a.datetime);
    const eventKey = `${baseCity}|${minKey}`;
    
    if (!seenEvents.has(eventKey)) {
      seenEvents.add(eventKey);
      cityEventCounts[baseCity] = (cityEventCounts[baseCity] || 0) + 1;
    }
  });
  
  const sortedCities = Object.entries(cityEventCounts).sort(([, a], [, b]) => b - a);
  const topCity = sortedCities[0];
  const uniqueDays = new Set(alarms.map(a => a.datetime.split(' ')[0]));
  
  return {
    totalAlarms: totalSirens, 
    topCityName: topCity?.[0] || 'N/A',
    topCityCount: topCity?.[1] || 0,
    activeDays: uniqueDays.size,
    affectedCitiesCount: uniqueBaseCities.size
  };
}

export function getTopCities(alarms: Alarm[], limit: number = 5) {
  const cityEventCounts: Record<string, number> = {};
  const seenEvents = new Set<string>();
  
  alarms.forEach(a => {
    const baseCity = normalizeCityName(a.city);
    const minKey = getMinuteKey(a.datetime);
    const eventKey = `${baseCity}|${minKey}`;
    
    if (!seenEvents.has(eventKey)) {
      seenEvents.add(eventKey);
      cityEventCounts[baseCity] = (cityEventCounts[baseCity] || 0) + 1;
    }
  });

  return Object.entries(cityEventCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

export function getMapData(alarms: Alarm[], polygons: Record<string, [number, number][]>): MapData[] {
  const cityCounts: Record<string, { count: number; lat?: number; lon?: number }> = {};
  
  alarms.forEach(a => {
    if (!cityCounts[a.city]) {
      cityCounts[a.city] = { count: 0, lat: a.lat, lon: a.lon };
    }
    cityCounts[a.city].count++;
  });

  const mapData: MapData[] = [];
  
  Object.entries(cityCounts).forEach(([city, data]) => {
    if (data.lat !== undefined && data.lon !== undefined) {
      mapData.push({
        city,
        count: data.count,
        lat: data.lat,
        lon: data.lon,
        polygon: polygons[city]
      });
    }
  });

  return mapData;
}
