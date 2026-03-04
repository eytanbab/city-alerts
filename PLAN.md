# City Alerts Visualization - Development Plan

This document outlines the roadmap for future enhancements to the city-alerts visualization platform.

---

## 1. UI/UX Improvements (Priority: High)

### At a Glance Metric Cards
Display high-level summary cards at the top of the dashboard to give users immediate context.
- **Total Alarms**: Cumulative count of sirens since Feb 27th.
- **Most Targeted City**: The city with the highest total siren frequency.
- **Active Days**: Total number of days since the start of data tracking.
- **Cities Affected**: Number of unique cities that have triggered sirens.

### Popular Cities "Quick-Select"
Add interactive "chips" or "tags" for frequently searched cities (e.g., Ashkelon, Tel Aviv, Sderot, Haifa) for one-click access.

### Refined Layout & Visual Polish
- **Grid-Based Dashboard**: Transition from a single vertical list to a responsive grid.
- **Enhanced Empty States**: Replace the dashed placeholder with a "Getting Started" guide or a "Recent Alarms" list.
- **Interactive Feedback**: Add hover effects and tooltips to charts to make data exploration more intuitive.
- **Consistency**: Use a unified color palette for siren intensity (e.g., shades of red/orange).

---

## 2. Advanced Feature Roadmap

### Geospatial Visualization (Map View)
Since the dataset includes Latitude/Longitude, a map is essential for regional context.
- **Nationwide Heatmap**: Visualize siren density hotspots across the country.
- **Interactive Markers**: Clickable markers that sync with the city-specific charts.
- **Defense Zone Overlays**: Display the `area` (defense zones) boundaries.

### Regional & Area-Based Analytics
- **Area Leaderboard**: Ranking of defense zones (e.g., Gush Dan vs. Haifa) by siren count.
- **North/South Split**: A comparative chart showing the volume of sirens in the northern vs. southern regions.

### Comparative Mode
Enable users to compare two cities directly.
- **Overlay Charts**: View the daily trends of two cities on a single graph.
- **Relative Statistics**: Percentage comparisons between cities.

### Temporal Analysis ("Punch Card" View)
A 2D heatmap showing Days of the Week vs. Hours of the Day.
- **Pattern Recognition**: Identify if specific times or days are statistically more prone to alerts.

### Date Range & Event Markers
- **Custom Date Selection**: A date picker to filter data for specific periods.
- **Event Milestones**: Annotate the trend line with significant dates or events (e.g., "Operation Start", "Specific Offensive").

---

## 3. Technical Debt & Performance
- **Data Caching**: Implement local storage caching for the parsed CSV to avoid repeated fetches.
- **Virtualization**: If the "Recent Alarms" list grows, use virtualization for smooth scrolling.
- **Testing**: Add unit tests for the data parsing and distribution logic in `lib/data.ts`.
