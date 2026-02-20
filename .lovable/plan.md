

# Update Loading Page Timing and Polling Strategy

## Changes

### 1. LoadingState.tsx -- Update messaging and progress bar
- **Line 29**: Change progress bar duration from 120 seconds to 300 seconds (5 minutes)
- **Line 58**: Change text from "about 1 minute" to "about 5 minutes"

### 2. Index.tsx -- Delay first poll and increase interval
- Add a `delayRef` to track the initial timeout alongside existing `pollRef` and `timerRef`
- Wait 120 seconds before the first poll, then poll every 20 seconds
- Set `maxAttempts` to 16 (covers ~320 seconds of polling after the 120s delay, totaling ~7.5 min max wait)
- Update `cleanup` function to also clear the delay timeout

## Technical Details

### File: `src/components/LoadingState.tsx`

**Progress bar (line 29):**
```tsx
const progress = Math.min((elapsedSeconds / 300) * 100, 95);
```

**User-facing text (line 58):**
```tsx
This typically takes about 5 minutes. Please don't close this page.
```

### File: `src/pages/Index.tsx`

**Add delayRef (near line 27):**
```tsx
const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

**Update cleanup function to clear delayRef:**
```tsx
const cleanup = useCallback(() => {
  if (pollRef.current) clearInterval(pollRef.current);
  if (timerRef.current) clearInterval(timerRef.current);
  if (delayRef.current) clearTimeout(delayRef.current);
  pollRef.current = null;
  timerRef.current = null;
  delayRef.current = null;
}, []);
```

**Replace polling logic (lines ~74-101):** Replace the immediate `setInterval` with a delayed start:
```tsx
let attempts = 0;
const maxAttempts = 16;

delayRef.current = setTimeout(() => {
  pollRef.current = setInterval(async () => {
    attempts++;
    // ... same polling/error/timeout logic ...
  }, 20000);
}, 120000);
```

