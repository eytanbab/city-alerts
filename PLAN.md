# Refactoring & Optimization Plan

## Phase 1: Performance & Bundle Optimization

- [x] **Dynamic Chart Loading**: Move `AlarmChart` and `DailyTrendChart` to `next/dynamic` with `ssr: false`.
- [x] **Optimized Icon Imports**: Grouped lucide-react imports for efficient Next.js tree-shaking.
- [x] **Stable Skeleton Keys**: Replace `key={i}` in skeletons with unique, stable keys.
- [x] **Static Shell Rendering**: Refactor skeletons to render static card titles, headers, and icons immediately.

## Phase 2: Accessibility & Correctness

- [x] **ARIA Compliance**: Fix `CitySearch.tsx` combobox role by adding missing `aria-controls` and `aria-expanded` attributes.
- [x] **React Doctor Audit**: Resolved diagnostics (Audit Score: 99/100).
- [x] **Hydration Fix**: Resolved hydration mismatches from browser extensions using `suppressHydrationWarning`.

## Phase 3: Code Readability & Maintenance

- [x] **Dead Code Removal**: Delete unused UI components and unused exports.
- [x] **Type Consolidation**: Clean up `lib/types.ts` and ensure strict typing across all shared utilities.

## Phase 4: Next.js 16 Expert Patterns

- [x] **Granular Cache Life**: Implemented Next.js 16 `'use cache'` and `cacheLife` in `lib/server-data.ts`.
- [x] **Strict Client Boundaries**: Audited third-party library usage to ensure perfect isolation from SSR.

## Phase 5: Architectural Refactoring

- [x] **Multi-Page Routing**: Split the dashboard into `/` (National Overview) and `/analysis` (City Analysis).
- [x] **Deep Linking**: Implement URL-based city selection (e.g., `/analysis?city=אשקלון`).
- [x] **Navigation UX**: Implement a consistent Header/Navigation component.
- [x] **Bulletproof Map Stability**: Replaced `react-leaflet` with a manual vanilla Leaflet implementation in `MapChart.tsx` to resolve persistent DOM/Hydration errors.

## Phase 6: Quality Assurance & Testing

- [x] **Unit Testing**: Implement Vitest suite for data utilities and core UI components.
- [ ] **E2E Testing**: Implement Playwright verification for critical user journeys.
  - [ ] **Infrastructure Setup**:
    - [ ] Install `@playwright/test` and browsers.
    - [ ] Configure `playwright.config.ts` (BaseURL, WebServer, Reporters).
    - [ ] Initialize `e2e/` directory structure.
  - [ ] **Page Object Model (POM) Implementation**:
    - [ ] Create `NavigationPage` for global layout checks.
    - [ ] Create `AnalysisPage` for city-specific interactions.
  - [ ] **Critical Path Tests**:
    - [ ] **Smoke Tests**: Verify app boots and `dir="rtl"` is applied globally.
    - [ ] **Navigation & Leaderboard**: 
      - [ ] Test header navigation between `/` and `/analysis`.
      - [ ] Verify clicking a city in the National Leaderboard navigates to filtered `/analysis`.
    - [ ] **National Dashboard**: Validate aggregate stats cards and Map presence.
    - [ ] **City Search Flow**: Test Hebrew input, virtualized list scrolling, and city selection.
    - [ ] **Deep Linking**: Verify `?city=...` correctly hydrates the UI without manual interaction.
    - [ ] **Data Resilience (Network Interception)**:
      - [ ] Intercept `all.json` request and return 500 to verify "Fallback Data" banner visibility.
    - [ ] **Responsive & Theme**:
      - [ ] Verify layout stability on mobile viewports (390x844).
      - [ ] Verify `ModeToggle` correctly switches dark/light classes.
  - [ ] **Visual & Behavioral Verification**:
    - [ ] Verify Charts (Recharts) render via SVG path checks.
    - [ ] Verify Map markers/popups are interactable.
  - **Success Criteria**:
    - 100% pass rate for critical path tests.
    - Automated verification of Hebrew text rendering and RTL layout.
    - Deep linking correctly recovers application state from URL.
    - Maps and charts verified to be present and interactive.
- [x] **Post-Rewrite Verification**: Establish automated linting, type-checking, and build validation.
