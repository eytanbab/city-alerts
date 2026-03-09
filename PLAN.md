# city-alerts - Development Plan

### Global Features
- [ ] **PWA Integration**: Add `manifest.json`, service workers, and icons to make the app installable on mobile.
- [ ] **Push Notifications**: Implement Web Push API for background alerts even when the app is closed.
- [ ] **Accessibility (a11y) Audit**: Ensure all components (especially real-time alerts) are accessible to screen readers (ARIA labels, focus management).
- [ ] **Advanced SEO**: Dynamic Open Graph images using `@vercel/og` for city-specific sharing.
- [x] **Localization Refinement**: Complete Hebrew translation for all UI elements and chart tooltips.
- [x] **Dark Mode Polish**: Ensure all shadcn components have proper contrast and styling in both light and dark modes.

### National Overview (`/`)
- [ ] **Map Heatmap Layer**: Add a heatmap toggle to the Leaflet map to visualize alert density across Israel.
- [ ] **Historical Date Range**: Add a date range picker to filter historical data (beyond the current Feb 28th, 2026 default).
- [x] **Regional Analytics**: Add a "Region-based Leaderboard" (North, South, Center, Jerusalem) to aggregate stats by district.
- [ ] **Global Daily Trend Comparison**: Show a "Week-over-Week" comparison in the national trend chart.
- [ ] **Trend Indicators in StatCards**: Add percentage change (up/down) to the national stats cards for current day vs. previous day.

### City Analysis (`/analysis`)
- [x] **Comparison Mode**: Enable side-by-side comparison for two or more cities (already supported by `nuqs` array, but needs UI for comparison).
- [ ] **Data Export**: Add a button to export filtered city data as CSV or JSON.
- [ ] **Proximity Guidelines**: Integrate official Home Front Command (Pikuad HaOref) guidelines based on the city's alert zone (time to reach shelter).
- [ ] **Enhanced Charts**: Add "Day of Week" distribution to see if certain days are more active for specific cities.
- [x] **Hourly Intensity Switcher**: Multi-view component (Bar, Line) for comparing hourly distribution across cities with perfect legend alignment.

### Infrastructure & Performance
- [x] **RSC Optimization**: Shift heavy data processing to Server Components using the `rsc-data-optimizer` pattern.
- [ ] **Visual Regression Testing**: Implement Playwright visual comparisons (`expect(page).toHaveScreenshot()`) to protect RTL layout integrity.
- [ ] **Error Monitoring**: Set up a lightweight error tracking system (e.g., Sentry or LogRocket) for production.
- [ ] **Edge Runtime**: Evaluate moving API routes to Edge Runtime for faster response times in the Middle East region.
