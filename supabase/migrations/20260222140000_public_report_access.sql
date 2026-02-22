-- Add public SELECT policy for the reports bucket
-- This allows unauthenticated users to view shared reports via their public URLs

CREATE POLICY "Public select access for reports"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'reports');
