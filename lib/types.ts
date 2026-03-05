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

export interface GlobalStats {
  totalAlarms: number;
  topCityName: string;
  topCityCount: number;
  activeDays: number;
  affectedCitiesCount: number;
}

export interface LeaderboardEntry {
  name: string;
  count: number;
}

export interface ChartEntry {
  hour?: string;
  date?: string;
  count: number;
}

export interface DashboardData {
  alarms: Alarm[];
  polygons: Record<string, [number, number][]>;
  stats: GlobalStats | null;
  topCities: LeaderboardEntry[];
  mapData: MapData[];
  globalDailyTrend: { date: string; count: number }[];
  citiesList: string[];
  lastUpdated: string;
}
