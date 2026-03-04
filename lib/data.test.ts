import { describe, it, expect } from 'vitest';
import { normalizeCityName, getUniqueCities, getHourlyDistribution, getDailyTrend, getGlobalStats, getMapData, Alarm } from './data';

const mockAlarms: Alarm[] = [
  { datetime: '2026-02-28 10:00:00', city: 'חיפה - כרמל', lat: 32.79, lon: 34.98 },
  { datetime: '2026-02-28 10:15:00', city: 'חיפה - כרמל', lat: 32.79, lon: 34.98 },
  { datetime: '2026-02-28 11:00:00', city: 'תל אביב - מרכז העיר', lat: 32.07, lon: 34.77 },
];

describe('Data Utility Functions', () => {
  it('should normalize city names by removing sectors', () => {
    expect(normalizeCityName('חיפה - כרמל')).toBe('חיפה');
    expect(normalizeCityName('אשדוד - יא')).toBe('אשדוד');
  });

  it('should get unique sorted cities (sectors preserved)', () => {
    const cities = getUniqueCities(mockAlarms);
    expect(cities).toEqual(['חיפה - כרמל', 'תל אביב - מרכז העיר']);
  });

  it('should calculate hourly distribution correctly', () => {
    const haifaDist = getHourlyDistribution(mockAlarms, 'חיפה - כרמל');
    const tenAm = haifaDist.find(d => d.hour === '10:00');
    expect(tenAm?.count).toBe(2);
  });

  it('should calculate daily trend correctly', () => {
    const trend = getDailyTrend(mockAlarms);
    expect(trend).toHaveLength(1);
    expect(trend[0].count).toBe(3);
  });

  it('should get global stats', () => {
    const stats = getGlobalStats(mockAlarms);
    expect(stats?.totalAlarms).toBe(3);
    expect(stats?.affectedCitiesCount).toBe(2);
  });

  it('should get map data aggregated by full sector name', () => {
    const mapData = getMapData(mockAlarms);
    expect(mapData).toHaveLength(2);
    const haifa = mapData.find(d => d.city === 'חיפה - כרמל');
    expect(haifa?.count).toBe(2);
    expect(haifa?.lat).toBe(32.79);
  });
});
