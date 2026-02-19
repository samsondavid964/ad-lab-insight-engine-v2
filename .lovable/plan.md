

# Rename Form Fields

## Summary
Rename "Website URL" to "Google Ads ID" and "Business Name" to "Client Name" across the UI labels, form state, and the webhook POST body.

## Technical Details

### 1. `src/components/ReportForm.tsx`
- Change label "Business Name" to "Client Name" (with same icon)
- Change label "Website URL" to "Google Ads ID"
- Change icon from `Globe` to a suitable alternative (e.g., keep `Globe` or switch to a generic icon)
- Change input type from `url` to `text` (Google Ads IDs are not URLs)
- Update placeholder text accordingly (e.g., "e.g. 123-456-7890")
- Rename internal state variables: `businessName` -> `clientName`, `websiteUrl` -> `googleAdsId`
- Update the `onSubmit` callback prop type to pass `{ clientName, googleAdsId, startDate, endDate }`

### 2. `src/pages/Index.tsx`
- Update `handleSubmit` to destructure `clientName` and `googleAdsId` instead of `businessName` and `websiteUrl`
- Update the POST payload keys sent to the webhook: `business_name` becomes `client_name`, `website_url` becomes `google_ads_id`
- Update the `ReportHistoryEntry` usage to store `clientName` and `googleAdsId`
- Update `setBusinessName` references to use the new field name for display purposes

### 3. `src/lib/api.ts`
- Rename `InitiatePayload` fields: `business_name` -> `client_name`, `website_url` -> `google_ads_id`

### 4. `src/lib/report-history.ts`
- Rename `ReportHistoryEntry` fields: `businessName` -> `clientName`, `websiteUrl` -> `googleAdsId`

### 5. `src/components/ReportHistory.tsx`
- Update any references to `entry.businessName` / `entry.websiteUrl` to use the new field names

No changes to polling logic, report rendering, or any other behavior.

