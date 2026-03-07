# city-alerts - Feature Roadmap

This document outlines the planned functional enhancements for the **city-alerts** dashboard. Each feature is designed to provide deeper insights and better utility for users monitoring alert data during the "Lion's Roar" (שאגת הארי) operation.

---

## 1. Comparative Analysis Mode (City vs. City)

**Description**: Allow users to select two or more cities and compare their alert frequencies on the same chart.

- **Why it's useful**: Helps users and researchers understand regional disparities and relative risk levels between neighboring or similar cities.
- **Implementation Strategy**:
  - Update `CityAnalysisWrapper` to support multiple `city` parameters in the URL (e.g., `?city=אשקלון&city=אשדוד`).
  - Modify `AlarmChart` to render multiple data series with distinct colors.
  - **Skill**: `url-state-management` for syncing complex selections to the URL.

## 2. Regional Breakdown & Risk Zones

**Description**: Group city-level data into broader Home Front Command regions (e.g., גוש דן, עוטף עזה, גליל עליון).

- **Why it's useful**: Users often think in terms of their broader residential area. This provides a "Macro View" that complements the "Micro View" of individual cities.
- **Implementation Strategy**:
  - Map individual city IDs to their respective regions in a new metadata file.
  - Add a "Region" filter to the National Overview (`/`) and City Analysis (`/analysis`) pages.
  - **Skill**: `large-scale-map-visualization` for rendering regional polygons efficiently.

## 3. "Safe Interval" & Intensity Scoring

**Description**: A new metric calculating the "Quiet Time" (average/max time between sirens) and "Peak Intensity" (most sirens in a 10-minute window) for a specific city.

- **Why it's useful**: Provides psychological and tactical context beyond simple counters. It answers: "How often are the breaks?" and "How intense was the worst moment?"
- **Implementation Strategy**:
  - Add calculation logic to `lib/data.ts` to iterate through timestamps and find the largest gaps and highest density clusters.
  - Display these metrics as "Quick Stats" cards on the City Analysis page.

## 4. Conflict Timeline Slider (Interactive History)

**Description**: An interactive slider on the National Map (`/`) that allows users to "play back" the operation day by day.

- **Why it's useful**: Visualizes the geographical shift of the conflict over time (e.g., movement of fire from the South to the Center or North).
- **Implementation Strategy**:
  - Add a Range Slider component to the map interface.
  - Filter the `mapData` based on the selected date range in real-time.
  - **Skill**: `large-scale-map-visualization` to handle dynamic filtering of 19,000+ records without lag.

---

## Recommended Skills for Implementation

- **`url-state-management`**: Essential for handling multi-city comparisons and deep-linkable filters.
- **`large-scale-map-visualization`**: Critical for the timeline slider and regional heatmaps to ensure smooth performance on mobile and desktop.
- **`rsc-data-optimizer`**: Recommended as the dataset grows to ensure that server-side calculations for regions and intervals remain fast.
