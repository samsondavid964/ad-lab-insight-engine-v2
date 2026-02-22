CREATE TABLE public.report_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    google_ads_id TEXT,
    date_start DATE,
    date_end DATE,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'complete', 'error'
    html_content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.report_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own reports" ON public.report_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reports" ON public.report_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reports" ON public.report_jobs FOR UPDATE USING (auth.uid() = user_id);
