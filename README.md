# City Alerts Dashboard

An interactive visualization platform for monitoring siren alert data in Israel, focused on the "Lion's Roar" (מבצע שאגת הארי) operation. The dashboard provides a real-time, RTL-native interface for analyzing national alert trends and granular city-level statistics.

## Key Features

- **Geospatial Analysis**: Interactive mapping of alert clusters and city polygons using Leaflet.
- **Temporal Insights**: Hourly frequency distribution and daily trend tracking for 1,400+ cities.
- **Real-time Stats**: Global counters for total alarms, active days, and most-targeted locations.
- **RTL-Native UX**: Fully localized Hebrew interface with support for Right-to-Left layouts.

## Tech Stack

- **Framework**: Next.js 16 (App Router) & React 19
- **Data Handling**: Server-side fetching with explicit `'use cache'` logic
- **Styling**: Tailwind CSS 4 & shadcn/ui
- **Visualization**: Recharts & React Leaflet
- **Testing**: Vitest

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
# Start development server
npm run dev

# Run unit tests
npm test

# Build for production
npm run build
```

## Project Structure

- `app/`: Routing and server-side page entries.
- `components/`: Modular UI, charts, and interactive maps.
- `lib/`: Core logic, data normalization, and shared utilities.
- `public/`: Static assets and markers.

---

Data provided by [tzevaadom.co.il](https://www.tzevaadom.co.il).
