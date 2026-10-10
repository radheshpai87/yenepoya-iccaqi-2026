ALTER TABLE public.payment_proofs
  ADD COLUMN IF NOT EXISTS payment_type TEXT NOT NULL DEFAULT 'paper_submission_payment';

UPDATE public.payment_proofs
SET payment_type = CASE
  WHEN lower(category) LIKE '%participant%' OR lower(category) LIKE '%attendee%' OR lower(category) LIKE '%observer%'
    THEN 'participant_payment'
  ELSE 'paper_submission_payment'
END;

CREATE INDEX IF NOT EXISTS idx_payment_proofs_payment_type_created_at
  ON public.payment_proofs (payment_type, created_at DESC);
