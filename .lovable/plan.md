
# Fix Missing Business Name in Report Header

## Problem
The business name after "Report:" is actually rendered but invisible. The toolbar uses `bg-navy` (dark background) with `text-primary-foreground` on the parent div. In dark mode, `--primary-foreground` resolves to `222 47% 11%` -- essentially the same dark navy color as the background. The h2 inherits this color and becomes invisible.

## Solution
Add an explicit `text-white` class to the h2 element so it is always visible regardless of the theme's primary-foreground value.

## Technical Details

### File: `src/components/ReportViewer.tsx` (line 64)

Change:
```tsx
<h2 className="font-display text-lg font-semibold">
```

To:
```tsx
<h2 className="font-display text-lg font-semibold text-white">
```

One line, one class addition. The business name will be clearly visible against the dark navy toolbar in both light and dark modes.
