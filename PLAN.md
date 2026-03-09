# City-Alerts Refactoring Plan

This plan outlines the structural and architectural improvements to ensure the codebase remains maintainable, scalable, and idiomatic.

## 1. Directory Reorganization (Module-Based)
Shift from a flat structure to a feature-based hierarchy where each feature is a self-contained module.

- [ ] **`components/ui`**: Atomic primitives (Buttons, Cards, Dialogs).
- [ ] **`components/charts`**: Specialized visualization components (Map, Trends, Intensity).
- [ ] **`components/features`**: Domain-specific modules. Each module should have its own `__tests__` and `hooks` if local.
  - `features/alerts/`: `RealtimeAlerts`, `use-alerts.ts`, `AlertItem.tsx`.
  - `features/analysis/`: `CitySearch`, `CityMetricsCards`, `CitySummary`.
  - `features/overview/`: `StatCards`, `Leaderboard`, `RegionTabs`.
- [ ] **`components/layout`**: Global structural components (Navigation, ThemeProvider).
- [ ] **`hooks/`**: Global shared client-side logic (e.g., `use-media-query`).

## 2. Component Decomposition Roadmap
Apply the "Decomposition Pattern" to break down large components.

- [ ] **`RealtimeAlerts` Decomposition**:
  - Extract the WebSocket/Polling logic into `hooks/use-alerts.ts`.
  - Extract the toast rendering into a separate `AlertToast` component.
  - Separate the `ThreatConfig` into its own constant file within the feature.
- [ ] **`MapChart` Decomposition**:
  - Separate Leaflet initialization from data handling.
  - Create a `MapControls` sub-component.

## 3. Data & API Layer
- [ ] **Centralized Services**: Move fetch logic from `lib/data.ts` and `lib/server-data.ts` into a structured `lib/api/` or `lib/services/` directory.
- [ ] **Normalization**: Ensure data normalization happens in the service layer, not inside components.
- [ ] **Error Boundaries**: Implement React Error Boundaries for flaky data sources (Map, WebSocket).

## 4. Maintenance & DX (Developer Experience)
- [ ] **Test Organization**: Move `*.test.tsx` files to a `__tests__` folder within each feature directory or a top-level `tests/` folder to reduce noise.
- [ ] **Path Aliases**: Update `tsconfig.json` to support clean imports like `@/features/alerts`.
- [ ] **Documentation**: Maintain a `README.md` within each major feature directory explaining its purpose and data flow.

## 5. Implementation Phases
1. **Phase 1**: Move UI primitives to `components/ui` and Layout components to `components/layout`.
2. **Phase 2**: Group chart components and feature-specific components.
3. **Phase 3**: Extract logic into hooks and refine the `lib/` directory.
4. **Phase 4**: Standardize testing and path aliases.
