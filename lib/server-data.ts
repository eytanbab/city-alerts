'use cache';
import { cacheLife } from 'next/cache';
import { type DashboardData } from './types';
import { processRawAlarms } from './data';

const DATA_URL = 'https://www.tzevaadom.co.il/static/historical/all.json';
const CITIES_URL = 'https://www.tzevaadom.co.il/static/cities.json';
const POLYGONS_URL = 'https://www.tzevaadom.co.il/static/polygons.json';
const FILTER_DATE_UNIX = new Date('2026-02-28T00:00:00').getTime() / 1000;

/**
 * Server-side data fetching with Next.js 16 explicit caching.
 */
export async function getDashboardData(): Promise<DashboardData> {
  cacheLife('minutes'); 

  const [alarmsRes, citiesRes, polygonsRes] = await Promise.all([
    fetch(DATA_URL, { cache: 'no-store' }),
    fetch(CITIES_URL, { cache: 'no-store' }),
    fetch(POLYGONS_URL, { cache: 'no-store' })
  ]);

  if (!alarmsRes.ok || !citiesRes.ok || !polygonsRes.ok) {
    throw new Error('Failed to fetch data from source');
  }

  const rawAlarms = await alarmsRes.json();
  const citiesMetadata = (await citiesRes.json()).cities;
  const polygonsRaw = await polygonsRes.json();

  return processRawAlarms(rawAlarms, citiesMetadata, polygonsRaw, FILTER_DATE_UNIX);
}
