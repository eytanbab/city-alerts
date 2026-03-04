import Papa from 'papaparse';

export interface Alarm {
  datetime: string;
  city: string;
}

interface RawAlarmRow {
  time: string | number;
  cities: string | number;
  [key: string]: string | number | undefined;
}

const CSV_URL = 'https://raw.githubusercontent.com/yuval-harpaz/alarms/master/data/alarms.csv';
const FILTER_DATE = new Date('2026-02-27T00:00:00');

export async function fetchAlarms(): Promise<Alarm[]> {
  const response = await fetch(CSV_URL);
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<RawAlarmRow>(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const uniqueAlarms = new Set<string>();
        const alarms: Alarm[] = [];

        results.data.forEach((row) => {
          if (!row.time || !row.cities) return;
          
          const datetime = String(row.time);
          const alarmDate = new Date(datetime.replace(' ', 'T'));
          
          // Filter out old data and unnecessary 2019 data
          if (alarmDate < FILTER_DATE) return;

          // Normalize city name immediately
          const normalizedCity = normalizeCityName(String(row.cities));
          
          // De-duplicate: A city has 1 alarm at a specific timestamp, even if multiple sectors were triggered.
          const key = `${normalizedCity}|${datetime}`;
          
          if (!uniqueAlarms.has(key)) {
            uniqueAlarms.add(key);
            alarms.push({
              datetime,
              city: normalizedCity,
            });
          }
        });

        // console.log(`Parsed ${alarms.length} de-duplicated alarms, ${new Set(alarms.map(a => a.city)).size} unique cities`);
        resolve(alarms);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
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
