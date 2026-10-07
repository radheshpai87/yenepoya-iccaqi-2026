BEGIN;

-- Existing databases may predate these form fields.
ALTER TABLE public.paper_submissions
  ADD COLUMN IF NOT EXISTS author_category TEXT,
  ADD COLUMN IF NOT EXISTS publication_category TEXT;

-- Both INSERTs run in the same PostgreSQL statement/transaction. Any exception
-- rolls back both records. Storage remains a separate service operation.
CREATE OR REPLACE FUNCTION public.save_paper_submission(
  p_submission JSONB,
  p_registration JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  saved public.paper_submissions%ROWTYPE;
BEGIN
  IF p_submission->>'submission_id' IS NULL
     OR p_submission->>'submission_id' IS DISTINCT FROM p_registration->>'paper_id'
     OR COALESCE(p_submission->>'file_url', '') = '' THEN
    RAISE EXCEPTION 'Submission requires a manuscript and matching registration';
  END IF;

  INSERT INTO public.paper_submissions (
    submission_id, author_name, email, phone, institution,
    author_category, publication_category, track, paper_title, abstract,
    participation_mode, file_url, review_status, created_at
  ) VALUES (
    p_submission->>'submission_id', p_submission->>'author_name',
    p_submission->>'email', p_submission->>'phone', p_submission->>'institution',
    p_submission->>'author_category', p_submission->>'publication_category',
    p_submission->>'track', p_submission->>'paper_title', p_submission->>'abstract',
    p_submission->>'participation_mode', p_submission->>'file_url', 'Submitted',
    (p_submission->>'created_at')::TIMESTAMPTZ
  ) RETURNING * INTO saved;

  INSERT INTO public.registrations (
    name, email, phone, institution, category, currency, amount,
    mode, paper_id, paper_title, payment_status, created_at
  ) VALUES (
    p_registration->>'name', p_registration->>'email', p_registration->>'phone',
    p_registration->>'institution', p_registration->>'category',
    p_registration->>'currency', p_registration->>'amount', p_registration->>'mode',
    saved.submission_id, saved.paper_title, 'Pending', saved.created_at
  );

  RETURN to_jsonb(saved);
END;
$$;

REVOKE ALL ON FUNCTION public.save_paper_submission(JSONB, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_paper_submission(JSONB, JSONB) TO service_role;

COMMIT;
