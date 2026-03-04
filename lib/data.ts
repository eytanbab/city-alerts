import Papa from 'papaparse';

export interface Alarm {
  datetime: string;
  city: string;
}

const CSV_URL = 'https://raw.githubusercontent.com/yuval-harpaz/alarms/master/data/alarms.csv';
const FILTER_DATE = new Date('2026-02-27T00:00:00');

export async function fetchAlarms(): Promise<Alarm[]> {
  const response = await fetch(CSV_URL);
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const alarms = (results.data as any[])
          .filter((row: any) => row.time && row.cities)
          .map((row: any) => ({
            datetime: String(row.time),
            city: String(row.cities),
          }))
          .filter((alarm: Alarm) => {
            const alarmDate = new Date(alarm.datetime.replace(' ', 'T'));
            return alarmDate >= FILTER_DATE;
          });
        console.log(`Parsed ${alarms.length} alarms, ${new Set(alarms.map(a => a.city)).size} unique cities`);
        resolve(alarms);
      },
      error: (error: any) => {
        reject(error);
      },
    });
  });
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
  
  for (let i = 0; i < alarms.length; i++) {
    const alarm = alarms[i];
    if (alarm.city === cityName) {
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
