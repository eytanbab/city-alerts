import { type Alarm, type MapData, type DashboardData, type GlobalStats } from './types';

export * from './types';

export function normalizeCityName(city: string): string {
  // Removes sectors (after -) and parenthetical info
  return city.replace(/\(.*\)/g, '').split('-')[0].trim();
}

function getMinuteKey(datetime: string): string {
  return datetime.substring(0, 16);
}

export function processRawAlarms(
  rawAlarms: [number, number, string[], number][], 
  citiesMetadata: Record<string, { id: number; lat: number; lng: number }>, 
  polygonsRaw: Record<string, [number, number][]>,
  filterDateUnix: number
): DashboardData {
  const alarms: Alarm[] = [];
  const cityToPolygon: Record<string, [number, number][]> = {};
  const cityEventCounts: Record<string, number> = {};
  const seenEvents = new Set<string>();
  const uniqueBaseCities = new Set<string>();
  const dailyCounts: Record<string, number> = {};
  const citySirenCounts: Record<string, { count: number; lat?: number; lon?: number }> = {};
  let maxTimestamp = 0;

  rawAlarms.forEach(([, , cities, timestamp]) => {
    if (timestamp < filterDateUnix) return;

    if (timestamp > maxTimestamp) maxTimestamp = timestamp;

    const date = new Date(timestamp * 1000);
    const formatter = new Intl.DateTimeFormat('he-IL', {
      timeZone: 'Asia/Jerusalem',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value;
    
    // Format: YYYY-MM-DD HH:mm:ss
    const datetime = `${getPart('year')}-${getPart('month')}-${getPart('day')} ${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;
    const datePart = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
    const minKey = datetime.substring(0, 16);

    cities.forEach((cityName) => {
      const city = cityName.trim();
      const baseCity = normalizeCityName(city);
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
    });
  });

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

export function getCityDailyTrend(alarms: Alarm[], cityName: string) {
  const dailyCounts: Record<string, number> = {};
  const normalizedTarget = normalizeCityName(cityName);
  const seenMinutes = new Set<string>();

  const startDate = new Date('2026-02-28');
  const endDate = new Date(); // Today
  
  // Initialize all dates with 0
  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    dailyCounts[dateStr] = 0;
    current.setDate(current.getDate() + 1);
  }

  alarms.forEach(a => {
    if (normalizeCityName(a.city) === normalizedTarget) {
      const minKey = getMinuteKey(a.datetime);
      if (!seenMinutes.has(minKey)) {
        seenMinutes.add(minKey);
        const datePart = a.datetime.split(' ')[0];
        if (dailyCounts[datePart] !== undefined) {
          dailyCounts[datePart]++;
        }
      }
    }
  });

  return Object.entries(dailyCounts)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, count]) => ({ date, count }));
}
