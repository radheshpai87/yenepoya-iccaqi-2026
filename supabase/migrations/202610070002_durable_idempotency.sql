BEGIN;

-- Invoker RPCs need explicit table grants even on projects without default grants.
GRANT SELECT, INSERT ON public.registrations, public.paper_submissions TO service_role;

CREATE TABLE IF NOT EXISTS public.api_requests (
  operation TEXT NOT NULL CHECK (operation IN ('registration', 'submission')),
  request_id UUID NOT NULL,
  request_hash TEXT NOT NULL CHECK (request_hash ~ '^[0-9a-f]{64}$'),
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (operation, request_id)
);
ALTER TABLE public.api_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.api_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.api_requests TO service_role;

CREATE OR REPLACE FUNCTION public.save_registration(
  p_request_id UUID,
  p_request_hash TEXT,
  p_registration JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  previous public.api_requests%ROWTYPE;
  saved public.registrations%ROWTYPE;
BEGIN
  -- Serializes identical keys across every process, not just one server instance.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('registration:' || p_request_id::TEXT, 0)
  );
  SELECT * INTO previous FROM public.api_requests
    WHERE operation = 'registration' AND request_id = p_request_id;
  IF FOUND THEN
    IF previous.request_hash IS DISTINCT FROM p_request_hash THEN
      RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT' USING ERRCODE = '22023';
    END IF;
    RETURN previous.response;
  END IF;

  INSERT INTO public.registrations (
    name, email, phone, institution, category, currency, amount,
    mode, paper_id, paper_title, payment_status, created_at
  ) VALUES (
    p_registration->>'name', p_registration->>'email', p_registration->>'phone',
    p_registration->>'institution', p_registration->>'category',
    p_registration->>'currency', p_registration->>'amount', p_registration->>'mode',
    p_registration->>'paper_id', p_registration->>'paper_title', 'Pending',
    (p_registration->>'created_at')::TIMESTAMPTZ
  ) RETURNING * INTO saved;

  INSERT INTO public.api_requests(operation, request_id, request_hash, response)
    VALUES ('registration', p_request_id, p_request_hash, to_jsonb(saved));
  RETURN to_jsonb(saved);
END;
$$;

-- Wrap the atomic two-record function with persistent retry protection. The
-- records AND their cached response commit in the same database transaction.
CREATE OR REPLACE FUNCTION public.save_paper_submission(
  p_request_id UUID,
  p_request_hash TEXT,
  p_submission JSONB,
  p_registration JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  previous public.api_requests%ROWTYPE;
  saved JSONB;
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('submission:' || p_request_id::TEXT, 0)
  );
  SELECT * INTO previous FROM public.api_requests
    WHERE operation = 'submission' AND request_id = p_request_id;
  IF FOUND THEN
    IF previous.request_hash IS DISTINCT FROM p_request_hash THEN
      RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT' USING ERRCODE = '22023';
    END IF;
    RETURN previous.response;
  END IF;

  saved := public.save_paper_submission(p_submission, p_registration);
  INSERT INTO public.api_requests(operation, request_id, request_hash, response)
    VALUES ('submission', p_request_id, p_request_hash, saved);
  RETURN saved;
END;
$$;

REVOKE ALL ON FUNCTION public.save_registration(UUID, TEXT, JSONB)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.save_paper_submission(UUID, TEXT, JSONB, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_registration(UUID, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.save_paper_submission(UUID, TEXT, JSONB, JSONB) TO service_role;

COMMIT;
