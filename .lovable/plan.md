

# Update Loading Page Timing and Polling Strategy

## ✅ COMPLETED

### 1. LoadingState.tsx -- Updated messaging and progress bar
- Progress bar duration changed to 300 seconds (5 minutes)
- Text updated to "about 5 minutes"

### 2. Index.tsx -- Delayed first poll and increased interval
- Added `delayRef` to track initial timeout
- 120-second delay before first poll, then polls every 20 seconds
- `maxAttempts` set to 16
- Cleanup function clears `delayRef`, `pollRef`, and `timerRef`
