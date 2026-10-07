const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Execute the actual route handlers with an isolated, simulated Supabase outage.
// No server, production credentials, or external writes are used.
function loadModule(file, mocks, cache = new Map()) {
  const fullPath = path.resolve(file);
  if (cache.has(fullPath)) return cache.get(fullPath).exports;
  const module = { exports: {} };
  cache.set(fullPath, module);
  const source = ts.transpileModule(fs.readFileSync(fullPath, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const localRequire = (name) => {
    if (name in mocks) return mocks[name];
    if (name.startsWith('@/')) return loadModule(`src/${name.slice(2)}.ts`, mocks, cache);
    return require(name);
  };
  new Function('require', 'module', 'exports', source)(localRequire, module, module.exports);
  return module.exports;
}

function backend(options = {}) {
  const writes = [];
  const client = {
    async rpc(name, args) {
      assert.equal(name, 'save_paper_submission');
      if (options.failTable) return { data: null, error: { message: 'simulated transaction rollback' } };
      writes.push({ table: 'paper_submissions', records: [args.p_submission] });
      writes.push({ table: 'registrations', records: [args.p_registration] });
      return { data: { id: 'saved-id', ...args.p_submission }, error: null };
    },
    from(table) {
      return {
        insert(records) {
          writes.push({ table, records });
          const error = options.failTable === table ? { message: 'simulated outage' } : null;
          const data = error ? null : { id: 'saved-id', ...records[0] };
          return {
            error,
            select: () => ({ single: async () => ({ data, error }) }),
          };
        },
      };
    },
    storage: {
      from() {
        return {
          upload: async (storagePath) => {
            writes.push({ upload: storagePath });
            return options.failUpload
              ? { data: null, error: { message: 'storage outage' } }
              : { data: { path: storagePath }, error: null };
          },
          getPublicUrl: (storagePath) => ({ data: { publicUrl: `https://storage.test/manuscripts/${storagePath}` } }),
        };
      },
    },
  };
  const mocks = {
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
    '@/lib/supabaseClient': {
      isSupabaseConfigured: () => options.configured !== false,
      getSupabaseAdminClient: () => client,
    },
    '@/lib/rateLimit': { checkRateLimit: () => ({ success: true }), getClientIP: () => 'test' },
    '@/lib/idempotency': { getIdempotentResponse: () => null, setIdempotentResponse: () => {} },
  };
  return { writes, route: (name) => loadModule(`src/app/api/${name}/route.ts`, mocks) };
}

function registrationRequest() {
  return new Request('http://localhost/api/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', email: 'test@example.com', institution: 'University', category: 'Participants only' }),
  });
}
function submissionRequest(file = new File(['%PDF-1.7 test'], 'paper.pdf', { type: 'application/pdf' })) {
  const form = new FormData();
  for (const [key, value] of Object.entries({ authorName: 'Test', email: 'test@example.com', institution: 'University', paperTitle: 'Paper', abstract: 'Abstract', track: 'AI' })) {
    form.append(key, value);
  }
  if (file !== null) form.append('file', file);
  return new Request('http://localhost/api/submit-paper', { method: 'POST', body: form });
}

test('registration cannot succeed without configured durable storage', async () => {
  const b = backend({ configured: false });
  const response = await b.route('register').POST(registrationRequest());
  assert.ok(response.status >= 400);
  assert.notEqual((await response.json()).success, true);
  assert.equal(b.writes.length, 0);
});
test('registration reports database failures', async () => {
  const b = backend({ failTable: 'registrations' });
  const response = await b.route('register').POST(registrationRequest());
  assert.ok(response.status >= 400);
});
test('registration returns success only with saved record', async () => {
  const b = backend();
  const response = await b.route('register').POST(registrationRequest());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).registration.id, 'saved-id');
});
for (const file of [null, new File([], 'empty.pdf')]) {
  test(`submission rejects ${file === null ? 'missing' : 'empty'} manuscript before any writes`, async () => {
    const b = backend();
    const response = await b.route('submit-paper').POST(submissionRequest(file));
    assert.equal(response.status, 400);
    assert.equal(b.writes.length, 0);
  });
}
test('storage failure prevents database inserts', async () => {
  const b = backend({ failUpload: true });
  const response = await b.route('submit-paper').POST(submissionRequest());
  assert.ok(response.status >= 400);
  assert.equal(b.writes.filter((w) => w.table).length, 0);
});
test('linked registration failure prevents a success response', async () => {
  const b = backend({ failTable: 'registrations' });
  const response = await b.route('submit-paper').POST(submissionRequest());
  assert.ok(response.status >= 400);
});
test('submission success includes a durable manuscript and both records', async () => {
  const b = backend();
  const response = await b.route('submit-paper').POST(submissionRequest());
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.supabaseSaved, true);
  assert.match(body.submission.file_url, /^https:\/\/storage.test\/manuscripts\//);
  assert.deepEqual(b.writes.filter((w) => w.table).map((w) => w.table), ['paper_submissions', 'registrations']);
});

test('malformed JSON returns a client error', async () => {
  const b = backend();
  const response = await b.route('register').POST(new Request('http://localhost/api/register', { method: 'POST', body: '{broken' }));
  assert.equal(response.status, 400);
  assert.equal(b.writes.length, 0);
});
test('non-string text fields return a client error', async () => {
  const b = backend();
  const response = await b.route('register').POST(new Request('http://localhost/api/register', { method: 'POST', body: JSON.stringify({ name: 42 }) }));
  assert.equal(response.status, 400);
  assert.equal(b.writes.length, 0);
});
test('database outages return a retryable error without backend details', async () => {
  const b = backend({ failTable: 'registrations' });
  const response = await b.route('register').POST(registrationRequest());
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.success, false);
  assert.match(body.error, /retry/i);
  assert.doesNotMatch(body.error, /simulated outage/);
});

test('submission uses one atomic RPC and never writes a partial pair on failure', async () => {
  const b = backend({ failTable: 'registrations' });
  const response = await b.route('submit-paper').POST(submissionRequest());
  assert.equal(response.status, 503);
  assert.equal(b.writes.filter((w) => w.table).length, 0);
});
