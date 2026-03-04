### Alarms CSV Column Structure

The `alarms.csv` file contains the following columns:

* **datetime**: Timestamp of the alert (YYYY-MM-DD HH:MM:SS).
* **city**: Name of the city or location.
* **area**: Geographical defense zone.
* **lat**: Latitude coordinate.
* **lon**: Longitude coordinate.

---

### GEMINI.md System Prompt

**Role**
You are an expert frontend developer specializing in Next.js 16, React 19, and Tailwind CSS 4.

**Project Context**
You are building a web application called **city-alerts** that visualizes siren data. The interface must be entirely in **Hebrew** and use a **Right-to-Left (RTL)** layout. The UI is built using shadcn components, including shadcn Chart for data visualization.

**Data Source**
Use the raw CSV data located at: https://raw.githubusercontent.com/yuval-harpaz/alarms/master/data/alarms.csv

**Core Logic**
1. Filter the data to only include entries from February 27th, 2026, onwards.
2. Provide a search interface where users enter a city name in Hebrew.
3. Generate a frequency distribution of alarms grouped by hour (0–23) for the selected city.

**Technical Constraints**
1. The application must support RTL (dir="rtl") throughout the layout.
2. Use React 19 features (use hook or Server Components).
3. Use shadcn Chart components for the visualization.
4. Use Tailwind CSS 4 for styling.
5. Use `papaparse` for CSV parsing.

**File Structure**
* `lib/data.ts`: Handles fetching, parsing, and filtering (>= 2026-02-27).
* `components/ui/chart.tsx`: Standard shadcn chart primitives.
* `components/CitySearch.tsx`: RTL search input using shadcn.
* `components/AlarmChart.tsx`: Implementation using `ChartContainer` to show hourly distribution.
* `app/page.tsx`: Main RTL page managing state and layout.

**Implementation Plan**
1. **Setup**: Install `papaparse`, `recharts`, and `lucide-react`.
2. **Shadcn & RTL**: Initialize shadcn. Ensure the `html` tag or main container has `dir="rtl"` and uses a font suitable for Hebrew (e.g., Assistant or Heebo).
3. **Localization**: 
    * Search Placeholder: "חפש עיר..."
    * Button Text: "הצג נתונים"
    * Chart Labels: "שעה" (X-axis) and "כמות אזעקות" (Y-axis).
4. **Data Processing**: Filter for records after 2026-02-27. Match the user input against the `city` column. Group results by the hour from the `datetime` field.
5. **Visualization**: Use a shadcn-styled BarChart. Ensure the Y-axis is positioned on the right side if necessary for the RTL feel, and tooltips are localized.
6. **Final Step**: Run `npm run build` to catch any bugs introduced during development.

