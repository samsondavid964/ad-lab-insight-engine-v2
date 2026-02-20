
# Share Report via Public Link

## Overview
Add a "Share" button next to "Download HTML" in the report toolbar. Clicking it uploads the report HTML to Supabase Storage and copies a public URL to the clipboard. The URL points to a standalone page (`/shared/:id`) that renders only the report -- no app chrome, no "New Report" button.

## Prerequisites
- Connect to Supabase (Lovable Cloud recommended) to get storage capabilities

## Steps

### 1. Supabase Storage Bucket (SQL Migration)
- Create a public bucket called `reports`
- Add an RLS policy allowing anonymous reads (public viewing)
- Add an insert policy (for authenticated or anon uploads, depending on your auth setup -- since there's no auth currently, allow anon inserts)

### 2. Supabase Client Setup
- Create `src/integrations/supabase/client.ts` with the Supabase client (auto-generated when connecting via Lovable Cloud)

### 3. Share Logic in `ReportViewer.tsx`
- Add a "Share" button (with a `Share2` or `Link` icon) next to "Download HTML"
- On click:
  1. Generate a unique filename (e.g., `{clientName}-{timestamp}.html`)
  2. Upload the HTML string as a file to the `reports` bucket
  3. Get the public URL from Supabase Storage
  4. Copy the URL to clipboard
  5. Show a toast: "Link copied to clipboard!"
- Show a loading spinner on the button while uploading

### 4. Shared Report Page (`/shared/:id`)
- Create `src/pages/SharedReport.tsx`
  - Reads the filename from the URL param
  - Fetches the HTML from Supabase Storage public URL
  - Renders it in a full-screen iframe with no toolbar, no navigation, no "New Report" button
  - Shows a loading spinner while fetching
  - Shows an error message if the file doesn't exist
- Add a route in `App.tsx`: `<Route path="/shared/:id" element={<SharedReport />} />`

### 5. Files Changed/Created
- **New migration**: SQL to create `reports` bucket with public read policy
- **New file**: `src/pages/SharedReport.tsx` -- standalone viewer page
- **Modified**: `src/App.tsx` -- add `/shared/:id` route
- **Modified**: `src/components/ReportViewer.tsx` -- add Share button with upload logic

## Technical Notes
- The share URL format will be: `{app-url}/shared/{filename}`
- The SharedReport page fetches from Supabase Storage's public URL directly
- No authentication required for viewing shared reports
- Reports stored in storage persist until manually deleted
