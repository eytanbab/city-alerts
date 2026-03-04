import { describe, it, expect } from 'vitest';
import { normalizeCityName, getUniqueCities, getHourlyDistribution, getDailyTrend, getGlobalStats, getMapData, Alarm } from './data';

const mockAlarms: Alarm[] = [
  { datetime: '2026-02-28 10:00:00', city: 'חיפה' },
  { datetime: '2026-02-28 10:15:00', city: 'חיפה' },
  { datetime: '2026-02-28 11:00:00', city: 'תל אביב' },
  { datetime: '2026-03-01 12:00:00', city: 'אשדוד' },
  { datetime: '2026-03-01 12:00:00', city: 'אשדוד' }, // Duplicate for same city/time (should be handled by parser but here we test aggregators)
];

describe('Data Utility Functions', () => {
  it('should normalize city names by removing sectors', () => {
    expect(normalizeCityName('חיפה - כרמל')).toBe('חיפה');
    expect(normalizeCityName('אשדוד - יא')).toBe('אשדוד');
    expect(normalizeCityName('תל אביב - יפו')).toBe('תל אביב');
    expect(normalizeCityName('ירושלים')).toBe('ירושלים');
  });

  it('should get unique sorted cities', () => {
    const cities = getUniqueCities(mockAlarms);
    expect(cities).toEqual(['אשדוד', 'חיפה', 'תל אביב']);
  });

  it('should calculate hourly distribution correctly', () => {
    const haifaDist = getHourlyDistribution(mockAlarms, 'חיפה');
    const tenAm = haifaDist.find(d => d.hour === '10:00');
    const elevenAm = haifaDist.find(d => d.hour === '11:00');
    
    expect(tenAm?.count).toBe(2);
    expect(elevenAm?.count).toBe(0);
  });

  it('should calculate daily trend correctly', () => {
    const trend = getDailyTrend(mockAlarms);
    expect(trend).toHaveLength(2);
    expect(trend[0]).toEqual({ date: '2026-02-28', count: 3 });
    expect(trend[1]).toEqual({ date: '2026-03-01', count: 2 });
  });

  it('should get global stats', () => {
    const stats = getGlobalStats(mockAlarms);
    expect(stats?.totalAlarms).toBe(5);
    expect(stats?.topCityName).toBe('חיפה');
    expect(stats?.activeDays).toBe(2);
    expect(stats?.affectedCitiesCount).toBe(3);
  });

  it('should get map data for cities with coordinates', () => {
    const mapData = getMapData(mockAlarms);
    // Haifa, Tel Aviv, Ashdod are in our geodata mapping
    expect(mapData).toHaveLength(3);
    const haifa = mapData.find(d => d.city === 'חיפה');
    expect(haifa?.count).toBe(2);
    expect(haifa?.lat).toBeCloseTo(32.7940);
  });
});
