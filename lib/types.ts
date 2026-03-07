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

export interface CityMetrics {
  avgQuietTimeHours: number;
  maxQuietTimeHours: number;
  peakIntensity10Min: number;
  totalEvents: number;
}

export interface DashboardData {
  alarms: Alarm[];
  alarmsByCity: Record<string, Alarm[]>; // Grouped by normalized city name
  alarmsByRegion: Record<string, Alarm[]>; // Grouped by region name
  cityMetrics: Record<string, CityMetrics>;
  lastSirenPerCity: Record<string, string>; // Latest siren datetime per normalized city
  cityToRegion: Record<string, string>; // Normalized city name -> Region name
  polygons: Record<string, [number, number][]>;
  stats: GlobalStats | null;
  topCities: LeaderboardEntry[];
  mapData: MapData[];
  globalDailyTrend: { date: string; count: number }[];
  citiesList: string[];
  regionsList: string[];
  lastUpdated: string; // This is the timestamp of the latest alarm
  lastSync?: string; // This is the time the data was fetched from the server
  isFallback?: boolean;
}
