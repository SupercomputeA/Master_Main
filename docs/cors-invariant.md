# The /api/* CORS invariant — exact origin, one resolver, `Vary: Origin`

Status: enforced by `tests/cors/cors-allowlist.test.mjs` (CI: `validate` job).
Owner of the fix: card `t_492fdb5b` (SEC-F4), filed from the PR #98 security review
(`SEC-98-1`).

## What went wrong

17 Pages Functions each carried their own copy of `allowedOrigin()` /
`corsHeaders()`. The copies drifted into a predicate that echoed the **request's own
origin** whenever its host was:

```
host === 'supercompute.io' || host === 'supercompute.pages.dev' || host === 'localhost'
  || host === '127.0.0.1' || host.endsWith('.pages.dev')
  || host.endsWith('.cloudflarestaging.com') || host.endsWith('.ngrok-free.app')
```

Anyone can deploy a free `<anything>.pages.dev` site or register a free
`*.ngrok-free.app` tunnel, so that is not an allowlist — it is *"the public internet,
allowlisted by TLD"*. It was measured live against the **mutating** admin endpoint
`/api/subscribers/admin/expire-sweep`:

| Origin sent | `Access-Control-Allow-Origin` before | after |
|---|---|---|
| `https://definitely-not-ours-12345.pages.dev` | echoed verbatim ✗ | `https://supercompute.io` ✓ |
| `https://attacker.ngrok-free.app` | echoed verbatim ✗ | `https://supercompute.io` ✓ |
| `https://x.cloudflarestaging.com` | echoed verbatim ✗ | `https://supercompute.io` ✓ |
| `http://localhost:3000` / `http://127.0.0.1:8080` | echoed verbatim ✗ | `https://supercompute.io` ✓ |
| `https://evil.example.com` | `https://supercompute.io` ✓ | `https://supercompute.io` ✓ |
| `https://supercompute.io` | echoed ✓ | echoed ✓ |

`wrangler.toml` already declared `[vars] CORS_ORIGIN = "https://supercompute.io"` — the
intent was one exact origin and the handlers ignored it. `Vary: Origin` was absent on
`/api/auth`, `/api/subscribers` and `/api/investors/data-room`, so a shared cache could
pin one origin's response and serve it to another.

It was **not exploitable at the time**: auth on these endpoints is
`Authorization: Bearer` and `Access-Control-Allow-Credentials` is never set, so a
hostile page cannot ride a victim's session — it would need the token first. It becomes
exploitable the moment cookie auth or `ACAC: true` is added, which is why it was fixed
before that happens. The PR #98 preview lane made it worse by minting a fresh, publicly
resolvable `<branch>.supercompute.pages.dev` origin for every PR.

## The rule now

One module resolves CORS: `functions/_shared/cors.js`. It:

- reads the allowlist from **`env.CORS_ORIGIN`** (comma-separate for more than one),
  falling back to `https://supercompute.io` when unset. No host is matched by suffix,
  prefix or `includes`;
- echoes the request's own origin **only** when it is byte-identical to an entry on that
  list, and answers everything else with the configured primary origin (never the
  request's, never `*`);
- adds **`Vary: Origin`** to every response whose ACAO depends on the request;
- never sets `Access-Control-Allow-Credentials`;
- keeps dev origins (`localhost` / `127.0.0.1` on the usual dev ports) **out of the
  production set** and behind an explicit per-deployment opt-in:

  ```bash
  npx wrangler pages dev out --binding ALLOW_DEV_ORIGINS=true   # local work
  # production: set nothing
  ```

Do **not** put `ALLOW_DEV_ORIGINS` in `wrangler.toml` — that would re-trust localhost in
production, which is the defect this file exists to prevent (a test asserts it is absent).

Preview deployments need no entry: a preview serves its app and its `/api/*` from the
same origin, and same-origin requests are not subject to CORS.

## Where each handler gets its headers

| Shape | Example | How |
|---|---|---|
| inline header object | `api/auth.js`, `api/school.js`, `api/token.js`, `api/web3/[[catchall]].js` | `const allowedOrigin = corsOrigin(request, env)` + `'Vary': 'Origin'` in the object |
| local thin wrapper | `api/ens/[[action]].js`, `api/investors/*.js` | `corsHeaders(request, env)` → `corsHeadersFor(request, env, { methods, headers })` |
| pre-resolved origin | `api/marketplace*.js` | `const origin = corsOrigin(request, env)` then `corsHeaders(origin, opts)` |
| shared `json()` helper | `api/auth.js` (used by `api/auth/*.js`, `api/subscribers/*.js`) | default origin is `FALLBACK_ORIGIN`; it now also sends `Vary: Origin` |

`corsHeaders(origin, opts)` takes an **already-resolved** origin.
`corsHeadersFor(request, env, opts)` takes the request. Passing a `request` to
`corsHeaders()` serialises it into the header (`[object Request]`) — the test suite
caught exactly that mistake once, and a source rule now blocks it.

## The guard

```bash
node --test tests/cors/cors-allowlist.test.mjs   # npm run test:cors
```

It (1) drives the resolver with the 12-origin attack table, (2) imports all 17 handlers
and drives `OPTIONS` with forged origins, and (3) enforces source invariants, each as a
pure function also exercised against defect fixtures (M1 pre-fix copy, M2 a fresh copy,
M3 `corsHeaders(request, …)`, M4 a wrong-depth import) so the guard is proven to go red:

- exactly one module reads the `Origin` header — `functions/_shared/cors.js`;
- no `host.endsWith(...)` host matching anywhere under `functions/`;
- no shipped allowlist naming `*.pages.dev`, `*.cloudflarestaging.com`,
  `*.ngrok-free.app`, `localhost` or `127.0.0.1`;
- every handler that emits a request-derived ACAO imports the shared resolver;
- every `_shared/cors.js` import actually resolves to that module.

Adding a new `/api/*` surface: import the shared resolver. A second allowlist is the
defect, not a shortcut. (`functions/_shared/cors-origins.js` on the unmerged
`feature/social-rails-clean` / `security/social-admin-gate` branches is an earlier,
narrower helper — fold it into `cors.js` when those branches land rather than keeping two
resolvers.)
