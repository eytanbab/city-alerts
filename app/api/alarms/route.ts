import { NextResponse } from 'next/server';
import { processRawAlarms } from '@/lib/data';

const FILTER_DATE_UNIX = new Date('2026-02-28T00:00:00').getTime() / 1000;

export async function GET() {
  try {
    const [alarmsResponse, citiesResponse, polygonsResponse] = await Promise.all([
      fetch('https://www.tzevaadom.co.il/static/historical/all.json', { next: { revalidate: 600 } }),
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

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
