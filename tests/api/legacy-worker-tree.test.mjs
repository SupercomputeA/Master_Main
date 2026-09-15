/*
  Non-reachability pin for the deleted legacy standalone-Worker tree.

  SEC-F1d (t_30f803f0) decided that the legacy copy of the auth lane under `src/` was on no
  deploy path, and deliberately left it byte-exact instead of converging its admin read.
  t_11023e45 is the other half of that decision and deletes the tree. This suite is the
  tripwire that keeps the removal honest: it fails if the tree comes back, if a workflow puts
  it on a deploy path, if a script rebuilds its bundle, or if the Pages config grows a `main`
  that would let `wrangler deploy` publish a Worker from this repo.

  Deleting it was only safe because it was unreachable. These assertions are that proof, made
  executable — if one goes red, re-decide the deployment story before wiring anything up.
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Every path that made up the deleted tree (src/worker.js + src/api/* + src/utils/*).
const LEGACY_PATHS = [
  'src/worker.js',
  'src/api/auth.js',
  'src/api/articles.js',
  'src/api/agents.js',
  'src/api/projects.js',
  'src/api/staking.js',
  'src/utils/siwe.js',
  'src/utils/wallet.js',
];

// What it would take to put the tree back on a deploy path.
const DEPLOY_PATH_RE = /src\/worker\.js|src\/api\/|src\/utils\/|dist\/worker\.js|npm run build/;

test('the legacy standalone-Worker tree is gone', () => {
  const survivors = LEGACY_PATHS.filter((p) => existsSync(path.join(REPO_ROOT, p)));
  assert.deepEqual(
    survivors,
    [],
    'the legacy worker tree was deleted in t_11023e45 (its bundle was on no deploy path) — do not restore it',
  );
});

test('no workflow puts the legacy worker tree on a deploy path', () => {
  const dir = path.join(REPO_ROOT, '.github', 'workflows');
  const workflows = readdirSync(dir).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
  assert.ok(workflows.length > 0, 'expected workflow files under .github/workflows');

  for (const file of workflows) {
    // Comments are stripped first: this repo explains *why* things are dead in workflow prose,
    // and a guard that fires on the explanation is a guard the next person deletes.
    const code = readFileSync(path.join(dir, file), 'utf8')
      .split('\n')
      .map((line) => line.replace(/#.*$/, ''))
      .join('\n');
    assert.ok(
      !DEPLOY_PATH_RE.test(code),
      `.github/workflows/${file} would put the deleted legacy worker tree on a deploy path`,
    );
  }
});

test('package.json ships no script that rebuilds the legacy bundle', () => {
  const pkg = JSON.parse(readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
  for (const [name, cmd] of Object.entries(pkg.scripts ?? {})) {
    assert.ok(
      !/src\/worker\.js|src\/api\/|src\/utils\/|dist\/worker\.js/.test(cmd),
      `\`npm run ${name}\` would rebuild the deleted legacy bundle`,
    );
  }
});

test('the Pages config cannot publish a Worker bundle from this repo', () => {
  const wrangler = readFileSync(path.join(REPO_ROOT, 'wrangler.toml'), 'utf8');
  assert.match(wrangler, /pages_build_output_dir\s*=\s*"out"/, 'this is a Cloudflare Pages project');
  assert.ok(
    !/^\s*main\s*=/m.test(wrangler),
    'a `main` in wrangler.toml would let `wrangler deploy` bundle a Worker from this repo',
  );

  // What actually ships is the Pages Functions tree copied into the deploy root.
  const ci = readFileSync(path.join(REPO_ROOT, '.github', 'workflows', 'ci-cd.yml'), 'utf8');
  assert.match(ci, /cp -r functions/, 'the deploy lane ships `functions/` — that is the live API surface');
});
