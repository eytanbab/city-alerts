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

### E2E Testing & Quality Assurance
- [ ] **Navigation & Core Flows**: Verify seamless navigation between National Overview and City Analysis.
- [ ] **City Search & Deep Linking**: Automate verification of Hebrew search results and URL parameter synchronization via `nuqs`.
- [ ] **RTL Layout Integrity**: Use Playwright to ensure the right-to-left layout remains consistent across different viewports (Mobile/Desktop).
- [ ] **Real-time Alert Simulation**: Mock WebSocket events to verify notification popups and real-time chart updates.
- [ ] **Chart Accuracy & Interaction**: Ensure Recharts correctly render daily/hourly data points and tooltips are readable in RTL.
- [ ] **Automated Accessibility (a11y)**: Integrate `@axe-core/playwright` to scan for Hebrew ARIA label compliance and contrast issues.
- [ ] **Network Resilience**: Simulate Slow 3G and Offline states to verify loading skeletons and fallback API behavior.
- [ ] **Cross-Browser Verification**: Explicitly test on WebKit (Safari), Firefox, and Chromium to catch engine-specific RTL rendering bugs.
- [ ] **Edge Case States**: Verify UI behavior when historical data is empty or the WebSocket connection is unstable.
- [ ] **PWA Offline Mode**: Verify PWA installation and basic offline data persistence (once implemented).

### Infrastructure & Performance
- [x] **RSC Optimization**: Shift heavy data processing to Server Components using the `rsc-data-optimizer` pattern.
- [ ] **Visual Regression Testing**: Implement Playwright visual comparisons (`expect(page).toHaveScreenshot()`) to protect RTL layout integrity.
- [ ] **Error Monitoring**: Set up a lightweight error tracking system (e.g., Sentry or LogRocket) for production.
- [ ] **Edge Runtime**: Evaluate moving API routes to Edge Runtime for faster response times in the Middle East region.
