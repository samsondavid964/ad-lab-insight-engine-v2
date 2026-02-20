
# Fix Report Header Button Styling

## Problem
The "Download HTML" and "Share" buttons in the report toolbar are nearly invisible. The `outline` variant applies `bg-background` and default text colors that conflict with the dark navy toolbar. The custom `text-primary-foreground` class is being overridden by the variant's built-in styles.

## Solution
Switch the buttons from `variant="outline"` to `variant="ghost"` and apply explicit border + text styling, so the dark toolbar background shows through and text remains visible.

## Technical Details

### File: `src/components/ReportViewer.tsx`

**Download HTML button (line 68-76):** Change from `variant="outline"` to `variant="ghost"` and update classes:
```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={handleDownload}
  className="border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
>
```

**Share button (line 77-86):** Same change:
```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={handleShare}
  disabled={sharing}
  className="border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
>
```

This ensures:
- Transparent background so the navy toolbar shows through
- White text and border are visible against the dark background
- Hover state subtly lightens the button

Only one file is modified: `src/components/ReportViewer.tsx` (two small class changes).
