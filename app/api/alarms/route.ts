import { NextResponse } from 'next/server';
import { processRawAlarms } from '@/lib/data';
import { type DashboardData } from '@/lib/types';

export const dynamic = 'force-dynamic';

const FILTER_DATE_UNIX = new Date('2026-02-28T00:00:00').getTime() / 1000;

// In-memory cache to bypass Next.js 2MB fetch cache limit
let cachedDashboardData: DashboardData | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 2 * 60 * 1000; // Reduce to 2 minutes for more real-time feel

export async function GET() {
  const now = Date.now();

  try {
    // Return cached data if valid and NOT fallback
    if (cachedDashboardData && !cachedDashboardData.isFallback && (now - lastFetchTime < CACHE_TTL)) {
      return NextResponse.json(cachedDashboardData);
    }

    // Use regular fetch with revalidate: 0 to ensure we bypass all Next.js internal caches
    const [alarmsResponse, citiesResponse, polygonsResponse] = await Promise.all([
      fetch('https://www.tzevaadom.co.il/static/historical/all.json', { next: { revalidate: 0 } }),
      fetch('https://www.tzevaadom.co.il/static/cities.json', { next: { revalidate: 3600 } }),
      fetch('https://www.tzevaadom.co.il/static/polygons.json', { next: { revalidate: 3600 } })
    ]);
    
    if (!alarmsResponse.ok || !citiesResponse.ok || !polygonsResponse.ok) {
      throw new Error('Failed to fetch from source');
    }

    const rawAlarms = await alarmsResponse.json();
    const citiesMetadata = (await citiesResponse.json()).cities;
    const polygonsRaw = await polygonsResponse.json();

    const dashboardData = processRawAlarms(rawAlarms, citiesMetadata, polygonsRaw, FILTER_DATE_UNIX);
    dashboardData.isFallback = false;

    // Update manual cache
    cachedDashboardData = dashboardData;
    lastFetchTime = now;

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('API Route Error:', error);
    
    if (cachedDashboardData) {
      const fallbackData = { ...cachedDashboardData, isFallback: true };
      return NextResponse.json(fallbackData);
    }
    
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
