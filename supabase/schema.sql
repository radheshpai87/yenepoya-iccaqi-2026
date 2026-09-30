-- ====================================================================
-- Yenepoya ICCAQI 2026 - Supabase PostgreSQL Database Schema
-- Run this script inside the Supabase SQL Editor (https://app.supabase.com)
-- ====================================================================

-- 1. Create registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    institution TEXT NOT NULL,
    category TEXT NOT NULL,
    currency VARCHAR(10) NOT NULL,
    amount TEXT NOT NULL,
    mode TEXT NOT NULL,
    paper_id TEXT,
    paper_title TEXT,
    payment_status VARCHAR(20) DEFAULT 'Pending',
    notes TEXT
);

-- 2. Create paper_submissions table
CREATE TABLE IF NOT EXISTS public.paper_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    author_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    institution TEXT NOT NULL,
    track TEXT NOT NULL,
    paper_title TEXT NOT NULL,
    abstract TEXT NOT NULL,
    participation_mode TEXT,
    file_url TEXT NOT NULL,
    review_status VARCHAR(30) DEFAULT 'Under Review',
    reviewer_notes TEXT
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_paper_id ON public.registrations(paper_id);
CREATE INDEX IF NOT EXISTS idx_submissions_id ON public.paper_submissions(submission_id);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON public.paper_submissions(email);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_submissions ENABLE ROW LEVEL SECURITY;

-- 5. Public Insert Policies (Allows website visitors to submit forms)
CREATE POLICY "Allow public inserts to registrations" 
ON public.registrations FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public inserts to paper_submissions" 
ON public.paper_submissions FOR INSERT 
WITH CHECK (true);

-- 6. Private Storage Bucket Setup for Permanent PDF Evidence (Kept Forever)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('manuscripts', 'manuscripts', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Allow public uploads to manuscripts bucket for manuscript submissions
CREATE POLICY "Allow public uploads to manuscripts bucket" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'manuscripts');

-- 7. Enable Realtime Publications for Database Tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.paper_submissions;
