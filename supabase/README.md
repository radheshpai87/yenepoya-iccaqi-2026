# Persistence migrations

For an existing database, apply the files in `migrations/` in filename order using
Supabase SQL Editor or your normal migration runner. Do not rerun `schema.sql` on
an existing project: its original policies and publication statements are base
setup commands. For a new project, run `schema.sql` first, then the migrations.

The API requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
server-only `SUPABASE_SERVICE_ROLE_KEY`. Never expose the service-role key to the
browser. Deploy the migrations before deploying the updated application. If the
RPC is absent or storage/database access fails, the API returns an error and the
form stays available for retry; it no longer acknowledges an in-memory save.

`202610070001_atomic_submission.sql` adds the existing author/publication form
fields and the service-role-only `save_paper_submission` RPC. Its two inserts
commit together or roll back together. PostgreSQL cannot include a Storage upload
in that transaction. The server uploads first and preserves files after ambiguous
network failures, so an acknowledged/committed submission never loses its file
through premature cleanup. Unreferenced uploads can need later reconciliation.

These repository migrations do not automatically modify your hosted database.

`202610070002_durable_idempotency.sql` adds a private `api_requests` table and
service-role-only RPCs protected by transaction-scoped advisory locks. Identical
requests with the same UUID return their originally saved record, including after
server restarts and concurrent retries. A reused UUID with different normalized
fields or manuscript bytes returns HTTP 409. Each API now requires a UUID
`requestId`; deploy the API and updated forms together. The forms retain that UUID
for unchanged retry attempts and generate a new one when the input changes.
New keys represent new submissions; this does not deduplicate separate intentional
submissions by email address. Submission reference IDs now use UUIDs rather than
four-digit random numbers. Never delete retry records while clients may retry.

`202610100001_payment_proofs.sql` adds the private `payment_proofs` table and
`payment-receipts` Storage bucket. Apply this migration before deploying the
payment proof form and admin console changes. The admin API creates temporary
signed links so receipts stay private while administrators can view them.

Run the isolated API tests with `node tests/persistence.test.cjs`. They simulate
failures without contacting the hosted project. Database behavior checks are in
`tests/persistence.sql`; run them only on a disposable PostgreSQL/Supabase test
database after the base schema and both migrations. They roll back their fixtures.
