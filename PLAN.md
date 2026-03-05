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
- [x] **Bulletproof Map Stability**: Replaced `react-leaflet` with a manual vanilla Leaflet implementation in `MapChart.tsx` to resolve persistent DOM/Hydration errors (`appendChild`, `Map container is being reused`) during route transitions.
