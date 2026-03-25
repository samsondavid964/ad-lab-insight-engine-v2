-- Permit updates for report_jobs if the current user owns it, or if it is the global bot user.
DROP POLICY IF EXISTS "Users can update their own reports" ON public.report_jobs;
CREATE POLICY "Users can update their own reports or automated reports" 
ON public.report_jobs FOR UPDATE 
USING (auth.uid() = user_id OR user_id = 'd5cbc741-e8d9-43ee-9d90-32c409c3f40a');
