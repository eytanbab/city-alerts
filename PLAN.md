# city-alerts - Feature Roadmap

This document outlines the planned functional enhancements for the **city-alerts** dashboard. Each feature is designed to provide deeper insights into regional patterns and historical alert data.

---

## 1. Macro-Regional Statistics (North, Center, South)
**Description**: Group the existing data into three main geographic sectors: North, Center, and South.
- **Why it's useful**: Allows users to compare how the conflict is shifting between different parts of the country.
- **Implementation Strategy**:
  - Assign each Home Front Command area code to one of the three macro-regions.
  - Add a toggle or tabs on the National Overview (`/`) to switch between "National", "North", "Center", and "South" views.
  - Update `StatCards` and `DailyTrendChart` to reflect the selected macro-region.

## 2. Time-of-Day Risk Profile
**Description**: A heatmap or radar chart showing which times of the day are statistically the most "active" for sirens over the last 7 days.
- **Why it's useful**: Helps residents understand daily patterns (e.g., "Sirens are most frequent between 18:00 and 20:00").
- **Implementation Strategy**:
  - Aggregate data by hour across all cities or by selected city.
  - Use a specialized visualization (e.g., Heatmap) to show intensity across hours vs. days of the week.

## 3. Localized Summary Reports
**Description**: A "Snapshot" feature for cities that provides a human-readable summary of their alert history.
- **Why it's useful**: Quick context for users who want to know the "bottom line" for their location (e.g., "Ashkelon has had 4 alerts in the last 24 hours, which is 20% lower than the weekly average").
- **Implementation Strategy**:
  - Add a "Summary" section to the City Analysis page.
  - Calculate percentage changes and trend comparisons (Current 24h vs. previous 24h).

## 4. Map Layer Toggles
**Description**: Allow users to toggle between different map views (e.g., Points, Polygons, Heatmap).
- **Why it's useful**: Improves clarity on the map when there are thousands of data points.
- **Implementation Strategy**:
  - Use Leaflet layer controls to switch between cluster markers and a density-based heatmap.

---

## Recommended Skills for Implementation

- **`large-scale-map-visualization`**: Essential for implementing the Map Layer Toggles and ensuring the macro-region polygons perform well.
- **`rsc-data-optimizer`**: Recommended for the Regional Statistics to keep the heavy aggregation logic on the server side.
