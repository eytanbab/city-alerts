# City Alerts Dashboard

A visualization platform for siren alert data in Israel, focused on the "Lion's Roar" (מבצע שאגת הארי) operation. The dashboard provides an interface for analyzing national alert trends and city-level statistics from February 28, 2026, onwards.

## Features

### National Overview (`/`)

- **Live Siren Notifications**: An instant, nationwide alert system providing real-time visual updates for active sirens across the country.
- **Regional Sector Analysis**: Integrated geographic partitioning allowing users to focus the entire dashboard on specific regions (North, Center, or South).
- **National Alert Dashboard**: A high-level summary of siren activity, including total alerts, active days, and the number of affected locations.
- **Interactive Geospatial Map**: A visual map of Israel showing alert intensity through interactive city polygons and cluster markers.
- **National Trend Analysis**: A daily timeline chart tracking the frequency of alerts over time across the entire country.
- **Target & Silence Leaderboards**: A real-time ranking of both the most targeted cities and the quietest cities during the operation, with regional filtering support.

### City Analysis (`/analysis`)

- **Automated Performance Summaries**: Intelligent status reports for individual cities, calculating 24h intensity trends, weekly averages, and accurate historical "quiet streak" records (accounting for leading and trailing periods of silence).
- **Comparative Analysis Mode**: Select up to 5 cities to overlay their alert data on the same chart for direct comparison of risk levels and peak times.
- **"Safe Interval" & Intensity Scoring**: Advanced metrics for each city, including frequency-based average quiet time, maximum recorded silence period, and peak intensity (most sirens in a 10-minute window).
- **City-Level Frequency Analysis**: Detailed hourly distribution charts (0–23) for selected cities to identify patterns in siren activity.
- **Localized Historical Trends**: Custom daily trend charts for individual cities or compared groups to visualize alert history over time.

## Tech Stack

- **Framework**: Next.js 16 (App Router) and React 19
- **State Management**: nuqs for URL-synced state
- **Connectivity**: Real-time WebSockets and Shadcn Sonner for live alerts
- **Data Source**: Real-time fetching from `tzevaadom.co.il`
- **Data Optimization**: Local storage for static city metadata and geographical polygons
- **Styling**: Tailwind CSS 4 and shadcn/ui
- **Visualization**: Recharts and Leaflet
- **Testing**: Vitest (Unit, Utility, and Component tests)

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
