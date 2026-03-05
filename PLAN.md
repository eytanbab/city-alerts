# Refactoring & Optimization Plan

## Phase 1: Performance & Bundle Optimization
- [x] **Dynamic Chart Loading**: Move `AlarmChart` and `DailyTrendChart` to `next/dynamic` with `ssr: false` in `DashboardClient.tsx`.
- [x] **Optimized Icon Imports**: Grouped lucide-react imports for efficient Next.js tree-shaking.
- [x] **Stable Skeleton Keys**: Replace `key={i}` in `DashboardClient.tsx` and `app/loading.tsx` skeletons with unique, stable keys.
- [x] **Static Shell Rendering**: Refactor skeletons to render static card titles, headers, and icons immediately, using skeletons only for the dynamic numbers and chart areas.

## Phase 2: Accessibility & Correctness
- [x] **ARIA Compliance**: Fix `CitySearch.tsx` combobox role by adding missing `aria-controls` and `aria-expanded` attributes.
- [x] **React Doctor Audit**: Resolved diagnostics (Audit Score: 99/100).

## Phase 3: Code Readability & Maintenance
- [x] **Dead Code Removal**: Delete unused UI components (e.g., `components/ui/input.tsx`) and unused exports (`getMinuteKey`).
- [x] **Type Consolidation**: Clean up `lib/types.ts` and ensure strict typing across all shared utilities.

## Phase 4: Next.js 16 Expert Patterns
- [x] **Granular Cache Life**: Implemented Next.js 16 `'use cache'` and `cacheLife` in `lib/server-data.ts`.
- [x] **Strict Client Boundaries**: Audited third-party library usage (Leaflet, Recharts) to ensure perfect isolation from SSR.
