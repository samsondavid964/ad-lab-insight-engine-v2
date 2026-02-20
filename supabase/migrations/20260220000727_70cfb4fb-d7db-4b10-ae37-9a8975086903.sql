
-- Create public storage bucket for shared reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true);

-- Allow anyone to read reports
CREATE POLICY "Public read access for reports"
ON storage.objects FOR SELECT
USING (bucket_id = 'reports');

-- Allow anyone to upload reports (no auth in this app)
CREATE POLICY "Public insert access for reports"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reports');
