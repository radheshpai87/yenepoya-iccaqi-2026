-- Persist the full payment form and keep receipt files in a private bucket.
CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id TEXT,
  paper_id TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  institution TEXT NOT NULL,
  category TEXT NOT NULL,
  currency TEXT NOT NULL,
  amount TEXT NOT NULL,
  mode TEXT,
  paper_title TEXT,
  transaction_ref TEXT,
  file_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending Verification',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_proofs_created_at
  ON public.payment_proofs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_email
  ON public.payment_proofs (email);

ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.payment_proofs FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.payment_proofs TO service_role;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-receipts',
  'payment-receipts',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

REVOKE ALL ON TABLE public.payment_proofs FROM anon, authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_proofs;
