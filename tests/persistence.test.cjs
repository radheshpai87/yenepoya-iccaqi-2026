/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS harness loads isolated TypeScript modules. */
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
  const loadedModule = { exports: {} };
  cache.set(fullPath, loadedModule);
  const source = ts.transpileModule(fs.readFileSync(fullPath, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const localRequire = (name) => {
    if (name in mocks) return mocks[name];
    if (name.startsWith('@/')) return loadModule(`src/${name.slice(2)}.ts`, mocks, cache);
    return require(name);
  };
  new Function('require', 'module', 'exports', source)(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

function backend(options = {}) {
  const writes = [];
  const requests = options.requests || new Map();
  let loseResponse = options.loseResponse === true;
  const client = {
    async rpc(name, args) {
      const operation = name === 'save_registration' ? 'registration' : 'submission';
      assert.ok(['save_registration', 'save_paper_submission'].includes(name));
      const key = `${operation}:${args.p_request_id}`;
      const previous = requests.get(key);
      if (previous) {
        return previous.request_hash === args.p_request_hash
          ? { data: previous.response, error: null }
          : { data: null, error: { message: 'IDEMPOTENCY_CONFLICT' } };
      }
      if (options.failTable) return { data: null, error: { message: 'simulated transaction rollback' } };
      const record = operation === 'submission' ? args.p_submission : args.p_registration;
      const saved = { id: 'saved-id', ...record };
      if (operation === 'submission') writes.push({ table: 'paper_submissions', records: [args.p_submission] });
      writes.push({ table: 'registrations', records: [args.p_registration] });
      requests.set(key, { request_hash: args.p_request_hash, response: saved });
      if (loseResponse) {
        loseResponse = false;
        return { data: null, error: { message: 'network response lost after commit' } };
      }
      if (options.malformedRpcResponse) return { data: { id: saved.id, submission_id: saved.submission_id }, error: null };
      return { data: saved, error: null };
    },
    from(table) {
      assert.equal(table, 'api_requests', 'routes must save through transactional RPCs');
      const filters = {};
      const query = {
        select: () => query,
        eq: (key, value) => { filters[key] = value; return query; },
        maybeSingle: async () => ({
          data: requests.get(`${filters.operation}:${filters.request_id}`) || null,
          error: options.failLookup ? { message: 'lookup outage' } : null,
        }),
      };
      return query;
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
          remove: async (paths) => { writes.push({ removed: paths }); return { error: null }; },
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
  };
  return { writes, requests, route: (name) => loadModule(`src/app/api/${name}/route.ts`, mocks) };
}
const REQUEST_ID = 'a873943a-f380-4cf7-8cb8-bd80fbbf06e8';
const OTHER_REQUEST_ID = '4b73f6ee-8cd4-4bbb-82fc-024b28326347';

function registrationRequest(overrides = {}) {
  return new Request('http://localhost/api/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId: REQUEST_ID, name: 'Test', email: 'test@example.com', institution: 'University', category: 'Participants only', ...overrides }),
  });
}
function submissionRequest(file = new File(['%PDF-1.7 test'], 'paper.pdf', { type: 'application/pdf' }), overrides = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({ requestId: REQUEST_ID, authorName: 'Test', email: 'test@example.com', institution: 'University', paperTitle: 'Paper', abstract: 'Abstract', track: 'AI', ...overrides })) {
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
  const response = await b.route('register').POST(new Request('http://localhost/api/register', { method: 'POST', body: JSON.stringify({ requestId: REQUEST_ID, name: 42 }) }));
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

for (const name of ['register', 'submit-paper']) {
  const request = name === 'register' ? registrationRequest : () => submissionRequest();
  test(`${name}: retries return the same saved record without extra database writes`, async () => {
    const b = backend();
    const first = await b.route(name).POST(request());
    const second = await b.route(name).POST(request());
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.deepEqual(await second.json(), await first.json());
    assert.equal(b.writes.filter((w) => w.table === 'registrations').length, 1);
    if (name === 'submit-paper') assert.equal(b.writes.filter((w) => w.upload).length, 1);
  });
  test(`${name}: retry survives a new server instance`, async () => {
    const firstInstance = backend();
    const first = await firstInstance.route(name).POST(request());
    const secondInstance = backend({ requests: firstInstance.requests });
    const second = await secondInstance.route(name).POST(request());
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.deepEqual(await second.json(), await first.json());
    assert.equal(secondInstance.writes.length, 0);
  });
  test(`${name}: concurrent requests save only one record pair`, async () => {
    const b = backend();
    const [first, second] = await Promise.all([b.route(name).POST(request()), b.route(name).POST(request())]);
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.deepEqual(await second.json(), await first.json());
    assert.equal(b.writes.filter((w) => w.table === 'registrations').length, 1);
    if (name === 'submit-paper') {
      const uploads = b.writes.filter((w) => w.upload).map((w) => w.upload);
      assert.equal(new Set(uploads).size, uploads.length);
      const saved = await backend({ requests: b.requests }).route(name).POST(request());
      const savedUrl = (await saved.json()).submission.file_url;
      for (const removed of b.writes.flatMap((w) => w.removed || [])) {
        assert.notEqual(`https://storage.test/manuscripts/${removed}`, savedUrl);
      }
    }
  });
  test(`${name}: retry recovers a commit whose response was lost`, async () => {
    const b = backend({ loseResponse: true });
    const first = await b.route(name).POST(request());
    assert.equal(first.status, 503);
    assert.equal(b.writes.filter((w) => w.removed).length, 0);
    const retry = await b.route(name).POST(request());
    assert.equal(retry.status, 200);
    assert.equal(b.writes.filter((w) => w.table === 'registrations').length, 1);
  });
}
test('registration rejects reuse of a key with changed details', async () => {
  const b = backend();
  await b.route('register').POST(registrationRequest());
  const changed = await b.route('register').POST(registrationRequest({ name: 'Different' }));
  assert.equal(changed.status, 409);
  assert.equal(b.writes.filter((w) => w.table).length, 1);
});
test('submission rejects reuse of a key with different manuscript bytes', async () => {
  const b = backend();
  await b.route('submit-paper').POST(submissionRequest());
  const changed = await b.route('submit-paper').POST(submissionRequest(new File(['%PDF-1.7 changed'], 'paper.pdf', { type: 'application/pdf' })));
  assert.equal(changed.status, 409);
  assert.equal(b.writes.filter((w) => w.upload).length, 1);
});
test('failed persistent lookup prevents an unprotected submission upload', async () => {
  const b = backend({ failLookup: true });
  const response = await b.route('submit-paper').POST(submissionRequest());
  assert.equal(response.status, 503);
  assert.equal(b.writes.length, 0);
});
test('missing retry key is rejected', async () => {
  const b = backend();
  assert.equal((await b.route('register').POST(registrationRequest({ requestId: undefined }))).status, 400);
  assert.equal(b.writes.length, 0);
});
test('separate submissions have distinct UUID reference IDs', async () => {
  const b = backend();
  const first = await b.route('submit-paper').POST(submissionRequest());
  const second = await b.route('submit-paper').POST(submissionRequest(undefined, { requestId: OTHER_REQUEST_ID }));
  const a = (await first.json()).submissionId;
  const z = (await second.json()).submissionId;
  assert.match(a, /^ICCAQI-2026-[0-9a-f-]{36}$/);
  assert.notEqual(a, z);
});
test('client preserves retry keys for unchanged input and rotates them for changes', () => {
  const { requestAttempt } = loadModule('src/lib/clientRequestId.ts', {});
  const a = requestAttempt(null, 'same-fields');
  const retry = requestAttempt(a, 'same-fields');
  const changed = requestAttempt(a, 'changed-fields');
  assert.equal(retry.requestId, a.requestId);
  assert.notEqual(changed.requestId, a.requestId);
});

function renderForm(file, overrides = {}) {
  const updates = [];
  let index = 0;
  const jsx = (type, props) => ({ type, props });
  const hooks = {
    useState(initial) {
      const position = index++;
      const value = position in overrides ? overrides[position]
        : typeof initial === 'function' ? initial() : initial;
      return [value, (next) => updates.push({ position, value: next })];
    },
    useRef: (value) => ({ current: value }),
    useEffect: () => {},
  };
  const exports = loadModule(`src/components/${file}.tsx`, {
    react: { ...hooks, default: hooks },
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
    'lucide-react': new Proxy({}, { get: () => 'svg' }),
  });
  const tree = exports[file]({ isOpen: true, onClose: () => {} });
  function findForm(node) {
    if (!node || typeof node !== 'object') return null;
    if (node.type === 'form') return node;
    const children = node.props?.children;
    for (const child of Array.isArray(children) ? children.flat(Infinity) : [children]) {
      const found = findForm(child);
      if (found) return found;
    }
    return null;
  }
  const form = findForm(tree);
  assert.ok(form, 'rendered modal must contain a form');
  return { updates, submit: () => form.props.onSubmit({ preventDefault() {} }) };
}

for (const scenario of ['http-error', 'network-error', 'invalid-success', 'saved']) {
  test(`registration form only acknowledges confirmed saves: ${scenario}`, async (t) => {
    t.mock.method(globalThis, 'fetch', async () => {
      if (scenario === 'network-error') throw new Error('Network unavailable');
      if (scenario === 'http-error') return Response.json({ success: false, error: 'Please retry' }, { status: 503 });
      if (scenario === 'invalid-success') return Response.json({ success: true });
      return Response.json({ success: true, supabaseSaved: true, registration: { id: 'saved-id' } });
    });
    const previousWindow = globalThis.window;
    const opened = [];
    globalThis.window = { open: (url) => { opened.push(url); return {}; }, location: {} };
    try {
      const form = renderForm('RegisterModal');
      await form.submit();
      const acknowledged = form.updates.some((u) => u.position === 4 && u.value === true);
      assert.equal(acknowledged, scenario === 'saved');
      assert.equal(opened.length, scenario === 'saved' ? 1 : 0);
      if (scenario !== 'saved') assert.ok(form.updates.some((u) => u.position === 7 && u.value));
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });
}
for (const scenario of ['http-error', 'invalid-json', 'invalid-success', 'saved']) {
  test(`manuscript form only acknowledges confirmed saves: ${scenario}`, () => {
    const previousXHR = globalThis.XMLHttpRequest;
    globalThis.XMLHttpRequest = class {
      constructor() { this.upload = {}; }
      open() {}
      send(data) {
        assert.ok(data.get('requestId'));
        this.status = scenario === 'http-error' ? 503 : 200;
        this.responseText = scenario === 'invalid-json' ? 'broken-json' : JSON.stringify(
          scenario === 'saved' ? { success: true, supabaseSaved: true, submissionId: 'ICCAQI-2026-saved' }
            : scenario === 'http-error' ? { error: 'Please retry' } : { success: true },
        );
        this.onload();
      }
    };
    try {
      const form = renderForm('SubmitPaperModal', { 2: new File(['%PDF-1.7'], 'paper.pdf'), 10: 'form' });
      form.submit();
      assert.equal(form.updates.some((u) => u.position === 8 && u.value === true), scenario === 'saved');
      if (scenario !== 'saved') assert.ok(form.updates.some((u) => u.position === 3 && u.value));
    } finally {
      if (previousXHR === undefined) delete globalThis.XMLHttpRequest;
      else globalThis.XMLHttpRequest = previousXHR;
    }
  });
}

test('malformed save confirmation never triggers manuscript deletion', async () => {
  const b = backend({ malformedRpcResponse: true });
  const response = await b.route('submit-paper').POST(submissionRequest());
  assert.equal(response.status, 503);
  assert.equal(b.writes.filter((w) => w.removed).length, 0);
});
