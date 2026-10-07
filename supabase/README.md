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
