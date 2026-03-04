# City Alerts - Siren Visualization

An interactive dashboard for visualizing siren alert data in Israel, focusing on "Lion's Roar" operation (מבצע שאגת הארי) starting February 28, 2026.

## Features

- **Global Statistics**: Real-time overview of total alarms, most targeted cities, and active days.
- **Hourly Distribution**: Detailed analysis of siren frequency by hour for specific cities.
- **National Trends**: Daily trend visualization of sirens across the country.
- **City Search & Leaderboard**: Quick access to data for 1,400+ cities and a ranking of the most targeted locations.
- **RTL Support**: Full Hebrew interface with Right-to-Left layout.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui
- **Charts**: Recharts (via shadcn Chart)
- **Data Parsing**: PapaParse
- **Icons**: Lucide React

## Data Source

The data is fetched from the [yuval-harpaz/alarms](https://github.com/yuval-harpaz/alarms) repository, which tracks real-time alert data.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/`: Next.js app directory and page layouts.
- `components/`: React components including charts and search.
- `lib/`: Data fetching, parsing, and utility functions.
- `public/`: Static assets.
