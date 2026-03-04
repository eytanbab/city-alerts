import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch both historical alerts and city metadata (coordinates)
    const [alarmsResponse, citiesResponse] = await Promise.all([
      fetch('https://www.tzevaadom.co.il/static/historical/all.json', { next: { revalidate: 600 } }),
      fetch('https://www.tzevaadom.co.il/static/cities.json', { next: { revalidate: 3600 } })
    ]);
    
    if (!alarmsResponse.ok || !citiesResponse.ok) {
      throw new Error('Failed to fetch from source');
    }

    const alarms = await alarmsResponse.json();
    const citiesData = await citiesResponse.json();

    return NextResponse.json({
      alarms,
      cities: citiesData.cities // This contains the { "City Name": { lat, lng, ... } } mapping
    });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
