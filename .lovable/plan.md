

# Fix Polling Response Handling

## The Situation

The polling webhook returns `{"status":"complete","html":"..."}` where the HTML value is a single-line string with escaped quotes (`\"`) and `\n` for line breaks. The current code uses `res.json()` which should handle standard JSON escaping automatically.

However, to be safe against edge cases (e.g., the response arriving as plain text instead of proper `application/json`, or double-encoding), the fix will add explicit response handling.

## Changes

### `src/lib/api.ts` — Update `pollForCompletion`

Instead of blindly calling `res.json()`, the function will:

1. Read the response as **raw text** first
2. Parse it as JSON manually
3. If the `html` field is still a JSON-escaped string (double-encoded), detect and unescape it
4. Return the normalized `PollResponse`

```typescript
export async function pollForCompletion(jobId: string): Promise<PollResponse> {
  const res = await fetch(`${POLL_URL}?job_id=${encodeURIComponent(jobId)}`);
  if (!res.ok) throw new Error(`Poll failed: ${res.status}`);

  const text = await res.text();
  const data = JSON.parse(text);

  // Handle case where html might be double-encoded
  if (data.status === "complete" && data.html) {
    let html = data.html;
    // If the html string still starts with a quote, it may be double-encoded
    if (html.startsWith('"') || html.startsWith('\\"')) {
      try { html = JSON.parse(html); } catch { /* use as-is */ }
    }
    return { status: "complete", html };
  }

  return data;
}
```

This is a single-file change to `src/lib/api.ts`. No other files need modification — `Index.tsx` and `ReportViewer.tsx` already handle the `PollResponse` correctly once the HTML string is properly decoded.

