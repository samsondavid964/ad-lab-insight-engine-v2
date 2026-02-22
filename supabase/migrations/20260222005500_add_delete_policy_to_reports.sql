-- Add missing DELETE policy for report_jobs
CREATE POLICY "Users can delete their own reports" ON public.report_jobs FOR DELETE USING (auth.uid() = user_id);
