

# Full Visual Editor for Generated Reports

## Overview
Add an edit mode to the report viewer that lets you modify text, update Chart.js chart data, restyle elements, and rearrange sections -- all before saving and sharing.

## How It Will Work

### 1. Edit Mode Toggle
A new "Edit" button in the toolbar activates edit mode. When active, the report becomes interactive: click any text to edit it, click a chart to open its data editor, and drag sections to reorder them.

### 2. Inline Text Editing
The iframe document body gets `contentEditable` enabled. You can click on any heading, paragraph, or label and type directly to change it. A floating toolbar appears near your selection with formatting options (bold, italic, font size, text color).

### 3. Chart.js Data Editor
When you click on a chart in the report, a slide-out sidebar panel opens showing:
- The chart's data labels and values in an editable table
- Chart title and axis labels
- Chart type selector (bar, line, pie, doughnut)
- Color pickers for each dataset

Changes update the chart in real-time by accessing the Chart.js instance through the iframe's window context.

### 4. Section Reordering
Top-level sections of the report get drag handles in edit mode. You can drag to reorder entire sections (e.g., move "Traffic Sources" above "Conversion Summary").

### 5. Style Controls
A sidebar tab with:
- Font family picker (from a curated list)
- Background color for sections
- Accent/highlight color

### 6. Save and Share
After editing, clicking "Save" extracts the modified HTML from the iframe (including updated Chart.js configurations serialized back into the HTML). The existing Share and Download flows then work with the edited version.

## Technical Details

### New Files
- `src/components/report-editor/EditToolbar.tsx` -- Floating text formatting toolbar (bold, italic, color, size)
- `src/components/report-editor/ChartEditor.tsx` -- Sidebar panel for editing Chart.js data/config
- `src/components/report-editor/SectionReorder.tsx` -- Drag-and-drop section reordering logic
- `src/components/report-editor/StyleEditor.tsx` -- Font/color/background style controls
- `src/components/report-editor/useChartInstances.ts` -- Hook to discover and interact with Chart.js instances inside the iframe
- `src/components/report-editor/useEditMode.ts` -- Hook managing edit mode state, contentEditable toggling, and HTML extraction

### Modified Files
- `src/components/ReportViewer.tsx` -- Add Edit button, integrate editor sidebar, track edited HTML state, pass edited HTML to share/download

### Key Technical Approaches

**Accessing Chart.js in the iframe:**
Since the iframe uses `allow-same-origin`, we can access `iframeRef.current.contentWindow` to find Chart.js instances via `Chart.instances` (Chart.js v3+/v4 exposes all active chart instances). We read their config, present it in editable form, and call `chart.update()` after changes.

**Extracting edited HTML:**
When saving, we serialize the iframe's `document.documentElement.outerHTML`. For charts, we inject updated `<script>` blocks that recreate the charts with the new data so the saved HTML is self-contained.

**Section detection:**
Top-level sections are identified by common HTML patterns: `<section>`, `<div>` with heading children, or elements with specific class patterns. A heuristic approach scans the document structure.

**Drag-and-drop:**
Implemented using native HTML5 drag-and-drop API on the section wrapper elements within the iframe, keeping the dependency footprint minimal.

### Dependencies
No new npm packages required. All editing uses native browser APIs (contentEditable, execCommand/Selection API, HTML5 drag-and-drop) and direct Chart.js instance manipulation through the iframe context.

## Limitations and Considerations
- Chart editing depends on the reports actually using Chart.js (confirmed). If a report uses a different library, chart editing won't apply but text editing still works.
- Very complex layouts may not reorder cleanly; the section detection uses heuristics based on the report structure.
- `document.execCommand` is deprecated but still widely supported; for long-term, could migrate to the newer `Selection`/`Range` API.

