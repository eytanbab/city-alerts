# City Alerts Dashboard

A visualization platform for siren alert data in Israel, focused on the "Lion's Roar" (מבצע שאגת הארי) operation. The dashboard provides an interface for analyzing national alert trends and city-level statistics from February 28, 2026, onwards.

## Features

- **Geospatial Mapping**: Interactive visualization of alert clusters and city polygons.
- **Data Distribution**: Hourly frequency charts and daily trend analysis for all cities.
- **Summary Statistics**: Global counters for total alerts, active days, and targeted locations.
- **Deep Linking**: Support for city-specific URLs (e.g., `?city=אשקלון`) with synchronized navigation.
- **Streaming UI**: Progressive loading states for dashboard components using Suspense boundaries.

## Tech Stack

- **Framework**: Next.js 16 (App Router) and React 19
- **Data Source**: Real-time fetching from `tzevaadom.co.il`
- **Data Optimization**: Local storage for static city metadata and geographical polygons
- **Styling**: Tailwind CSS 4 and shadcn/ui
- **Visualization**: Recharts and Leaflet
- **Testing**: Vitest (Unit and Utility tests)

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
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Project Structure

- `app/`: Application routing and page entries.
- `components/`: Modular UI components and chart implementations.
- `lib/`: Core data processing and server-side fetching logic.
- `lib/data/`: Local storage for static city and polygon definitions.

---

Data provided by [tzevaadom.co.il](https://www.tzevaadom.co.il).  
Project by [eytanbab](https://github.com/eytanbab).
