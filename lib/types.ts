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
  statsDate?: string;
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
  last24hFreqHours: number | null;
}

export interface RegionStats {
  stats: GlobalStats | null;
  topCities: LeaderboardEntry[];
  bottomCities: LeaderboardEntry[];
  globalDailyTrend: { date: string; count: number }[];
  hourlyDistribution: { hour: string; count: number }[];
  mapData: MapData[];
}

export interface DashboardData {
  alarms: Alarm[];
  alarmsByCity: Record<string, Alarm[]>; // Grouped by normalized city name
  cityMetrics: Record<string, CityMetrics>;
  lastSirenPerCity: Record<string, string>; // Latest siren datetime per normalized city
  polygons: Record<string, [number, number][]>;
  stats: GlobalStats | null;
  topCities: LeaderboardEntry[];
  bottomCities: LeaderboardEntry[];
  mapData: MapData[];
  globalDailyTrend: { date: string; count: number }[];
  hourlyDistribution: { hour: string; count: number }[];
  citiesList: string[];
  regions: Record<string, RegionStats>;
  lastUpdated: string; // This is the timestamp of the latest alarm
  lastSync?: string; // This is the time the data was fetched from the server
  isFallback?: boolean;
}

export enum ThreatType {
  Rockets = 0,
  HazardousMaterials = 1,
  Terrorists = 2,
  Earthquake = 3,
  Tsunami = 4,
  UnmannedAircraft = 5,
  NonConventionalMissile = 6,
  Radiological = 7,
  GeneralAlert = 8,
  Drill = 9,
}

export interface WebSocketAlert {
  cities: string[];
  threat: ThreatType;
  isDrill: boolean;
  notificationId?: string;
}
