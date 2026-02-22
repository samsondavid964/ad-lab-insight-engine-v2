-- Drop the insecure public insert policy
DROP POLICY IF EXISTS "Public insert access for reports" ON storage.objects;

-- Create secure insert policy for authenticated users only
CREATE POLICY "Authenticated insert access for reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reports');
