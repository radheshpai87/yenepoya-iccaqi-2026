-- Execute only on a disposable test database after schema.sql and both migrations.
-- All fixture records are rolled back. The runner must have permission to SET ROLE.
BEGIN;

DO $$
BEGIN
  IF has_function_privilege('anon', 'public.save_registration(uuid,text,jsonb)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'public.save_paper_submission(uuid,text,jsonb,jsonb)', 'EXECUTE')
     OR has_table_privilege('anon', 'public.api_requests', 'SELECT') THEN
    RAISE EXCEPTION 'Retry RPCs and cached personal data must be private';
  END IF;
END;
$$;

SET LOCAL ROLE service_role;
DO $$
DECLARE
  request_key UUID := gen_random_uuid();
  submission_key UUID := gen_random_uuid();
  failed_key UUID := gen_random_uuid();
  failed_reference TEXT := 'TEST-' || gen_random_uuid()::TEXT;
  hash TEXT := repeat('a', 64);
  reg JSONB := jsonb_build_object(
    'name', 'Persistence Test', 'email', 'persistence-test@example.invalid',
    'institution', 'Test Institution', 'category', 'Participants only',
    'currency', 'INR', 'amount', '300', 'mode', 'Online',
    'created_at', now()
  );
  sub JSONB := jsonb_build_object(
    'submission_id', 'TEST-' || gen_random_uuid()::TEXT,
    'author_name', 'Persistence Test', 'email', 'persistence-test@example.invalid',
    'institution', 'Test Institution', 'track', 'Test Track',
    'paper_title', 'Persistence Test Paper', 'abstract', 'Test Abstract',
    'file_url', 'https://example.invalid/manuscripts/test.pdf', 'created_at', now()
  );
  first JSONB;
  second JSONB;
  caught BOOLEAN := false;
BEGIN
  first := public.save_registration(request_key, hash, reg);
  second := public.save_registration(request_key, hash, reg);
  IF first IS DISTINCT FROM second THEN
    RAISE EXCEPTION 'Registration retry did not return the original record';
  END IF;
  IF (SELECT count(*) FROM public.registrations WHERE id = (first->>'id')::UUID) <> 1 THEN
    RAISE EXCEPTION 'Registration retry created duplicate records';
  END IF;

  BEGIN
    PERFORM public.save_registration(request_key, repeat('b', 64), reg);
  EXCEPTION WHEN invalid_parameter_value THEN
    caught := SQLERRM = 'IDEMPOTENCY_CONFLICT';
  END;
  IF NOT caught THEN RAISE EXCEPTION 'Changed request payload was not rejected'; END IF;

  reg := reg || jsonb_build_object('paper_id', sub->>'submission_id');
  first := public.save_paper_submission(submission_key, hash, sub, reg);
  second := public.save_paper_submission(submission_key, hash, sub, reg);
  IF first IS DISTINCT FROM second THEN
    RAISE EXCEPTION 'Submission retry did not return the original record';
  END IF;
  IF (SELECT count(*) FROM public.registrations WHERE paper_id = sub->>'submission_id') <> 1 THEN
    RAISE EXCEPTION 'Submission retry created duplicate linked registrations';
  END IF;

  -- Deliberately fail the SECOND insert. The first insert and retry entry must
  -- both be absent after the exception, proving atomic rollback.
  sub := sub || jsonb_build_object('submission_id', failed_reference);
  reg := reg || jsonb_build_object('paper_id', failed_reference, 'institution', NULL);
  caught := false;
  BEGIN
    PERFORM public.save_paper_submission(failed_key, hash, sub, reg);
  EXCEPTION WHEN not_null_violation THEN
    caught := true;
  END;
  IF NOT caught THEN RAISE EXCEPTION 'Expected linked-registration failure'; END IF;
  IF EXISTS (SELECT 1 FROM public.paper_submissions WHERE submission_id = failed_reference)
     OR EXISTS (SELECT 1 FROM public.api_requests WHERE request_id = failed_key) THEN
    RAISE EXCEPTION 'Failed transaction left a partial submission or retry record';
  END IF;

  -- Failure saving the retry record must ALSO roll back both business records.
  reg := reg || jsonb_build_object('institution', 'Test Institution');
  caught := false;
  BEGIN
    PERFORM public.save_paper_submission(failed_key, 'bad-hash', sub, reg);
  EXCEPTION WHEN check_violation THEN
    caught := true;
  END;
  IF NOT caught THEN RAISE EXCEPTION 'Expected retry-record constraint failure'; END IF;
  IF EXISTS (SELECT 1 FROM public.paper_submissions WHERE submission_id = failed_reference)
     OR EXISTS (SELECT 1 FROM public.registrations WHERE paper_id = failed_reference) THEN
    RAISE EXCEPTION 'Retry-record failure did not roll back both business records';
  END IF;
END;
$$;

ROLLBACK;
