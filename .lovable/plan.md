

# Generate job_id on Frontend and Include in Webhook Payload

## What Changes

Instead of receiving a `job_id` from the webhook response, the frontend will generate a random 16-digit numeric ID before sending the request, include it in the POST body, and immediately start polling with it.

## Technical Details

### 1. Update `src/lib/api.ts`

- Add a helper function to generate a 16-digit random number string (e.g., `"4829173650284917"`)
- Add `job_id` to the `InitiatePayload` interface
- Update `initiateReport` to include `job_id` in the JSON body
- The function will now return the locally-generated `job_id` instead of relying on the response body

### 2. Update `src/pages/Index.tsx`

- Import the ID generator from `api.ts`
- Generate the `job_id` before calling `initiateReport`
- Pass it into the payload
- Use the same `job_id` for polling (no change to polling logic itself)

### Helper Function

```typescript
function generateJobId(): string {
  let id = "";
  for (let i = 0; i < 16; i++) {
    id += Math.floor(Math.random() * 10).toString();
  }
  return id;
}
```

### Updated Payload Shape

```json
{
  "job_id": "4829173650284917",
  "business_name": "Acme Corp",
  "website_url": "https://example.com",
  "date_range": { "start": "2026-01-01", "end": "2026-01-31" }
}
```

No other files need changes. The polling logic and report history remain the same since they already use the `job_id` value.

