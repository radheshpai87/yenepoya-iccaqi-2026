BEGIN;

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS country TEXT;

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
    name, email, phone, institution, category, currency, amount, country,
    mode, paper_id, paper_title, payment_status, created_at
  ) VALUES (
    p_registration->>'name', p_registration->>'email', p_registration->>'phone',
    p_registration->>'institution', p_registration->>'category',
    p_registration->>'currency', p_registration->>'amount', p_registration->>'country',
    p_registration->>'mode', p_registration->>'paper_id', p_registration->>'paper_title',
    COALESCE(NULLIF(p_registration->>'payment_status', ''), 'Pending'),
    (p_registration->>'created_at')::TIMESTAMPTZ
  ) RETURNING * INTO saved;

  INSERT INTO public.api_requests(operation, request_id, request_hash, response)
    VALUES ('registration', p_request_id, p_request_hash, to_jsonb(saved));

  RETURN to_jsonb(saved);
END;
$$;

REVOKE ALL ON FUNCTION public.save_registration(UUID, TEXT, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_registration(UUID, TEXT, JSONB) TO service_role;

COMMIT;
