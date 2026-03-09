# City-Alerts Refactoring Plan

This plan outlines the structural and architectural improvements to ensure the codebase remains maintainable, scalable, and idiomatic.

## 1. Directory Reorganization (Module-Based)
Shift from a flat structure to a feature-based hierarchy where each feature is a self-contained module.

- [x] **`components/ui`**: Atomic primitives (Buttons, Cards, Dialogs, Skeletons).
- [x] **`components/charts`**: Specialized visualization components (Map, Trends).
- [x] **`components/features`**: Domain-specific modules. Each module has its own `__tests__`.
  - `features/alerts/`: `RealtimeAlerts`, `use-alerts.ts`, `threat-config.ts`.
  - `features/analysis/`: `CitySearch`, `CityMetricsCards`, `CitySummary`, `CityAnalysisContent`, `CityAnalysisWrapper`.
  - `features/overview/`: `StatCards`, `Leaderboard`, `RegionTabs`, `OverviewContent`, `LastUpdated`.
- [x] **`components/layout`**: Global structural components (Navigation, ThemeProvider, ModeToggle).
- [ ] **`hooks/`**: Global shared client-side logic (e.g., `use-media-query`).

## 2. Component Decomposition Roadmap
Apply the "Decomposition Pattern" to break down large components.

- [x] **`RealtimeAlerts` Decomposition**:
  - [x] Extract the WebSocket/Polling logic into `features/alerts/use-alerts.ts`.
  - [ ] Extract the toast rendering into a separate `AlertToast` component.
  - [x] Separate the `ThreatConfig` into its own constant file within the feature.
- [x] **`MapChart` Decomposition**:
  - [x] Separate Leaflet initialization from data handling (already achieved via `MapInner`).
  - [ ] Create a `MapControls` sub-component.

## 3. Data & API Layer
- [x] **Centralized Services**: Move fetch logic from `lib/data.ts` and `lib/server-data.ts` into a structured `lib/services/` directory.
- [x] **Normalization**: Ensure data normalization happens in the utility layer (`lib/utils/data-processor.ts`).
- [x] **Error Boundaries**: Implement React Error Boundaries for flaky data sources (Map, WebSocket).

## 4. Maintenance & DX (Developer Experience)
- [x] **Test Organization**: Move `*.test.tsx` files to a `__tests__` folder within each feature directory to reduce noise.
- [x] **Path Aliases**: Update `tsconfig.json` to support clean imports like `@/features/alerts`.
- [ ] **Documentation**: Maintain a `README.md` within each major feature directory explaining its purpose and data flow.

## 5. Implementation Phases
1. [x] **Phase 1**: Move UI primitives to `components/ui` and Layout components to `components/layout`.
2. [x] **Phase 2**: Group chart components and feature-specific components.
3. [x] **Phase 3**: Extract logic into hooks and refine the `lib/` directory.
4. [x] **Phase 4**: Standardize testing and path aliases.
