import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

// ─── SW precache paths exist on disk ─────────────────────────────────────────
test('every SW precache path resolves to a real file', () => {
  const sw = read('sw.js');
  const PREFIX = '/kids-spelling-assistant/';
  const matches = [...sw.matchAll(/["']\/kids-spelling-assistant\/([^"']+)["']/g)];
  const paths = matches.map(m => m[1].replace(/\?.*$/, '')); // strip query strings

  const missing = paths.filter(p => p && !fs.existsSync(path.join(ROOT, p)));
  assert.deepEqual(missing, [], `SW precache entries not found on disk: ${missing.join(', ')}`);
});

// ─── Version string consistency ───────────────────────────────────────────────
test('index.html script ?v= matches SW precache entry for app.js', () => {
  const html = read('index.html');
  const sw   = read('sw.js');

  const htmlVer = html.match(/scripts\/app\.js\?v=([\w-]+)/)?.[1];
  const swVer   = sw.match(/scripts\/app\.js\?v=([\w-]+)/)?.[1];

  assert.ok(htmlVer, 'index.html must have a ?v= query on scripts/app.js');
  assert.ok(swVer,   'sw.js precache must include scripts/app.js with a ?v= query');
  assert.equal(htmlVer, swVer,
    `Version mismatch — index.html has ?v=${htmlVer} but sw.js has ?v=${swVer}`);
});

// ─── deploy.yml firebase-config path matches app.js import ───────────────────
test('deploy.yml writes firebase-config.js to the path app.js imports it from', () => {
  const workflow = read('.github/workflows/deploy.yml');
  const appJs    = read('scripts/app.js');

  // Extract "cat > <path>" from workflow
  const workflowPath = workflow.match(/cat\s*>\s*([\w./]+firebase-config\.js)/)?.[1];
  // Extract dynamic import path (strip leading ./)
  const importPath = appJs.match(/import\(['"](\.[^'"]*firebase-config\.js)['"]\)/)?.[1]
    ?.replace(/^\.\//, '');

  assert.ok(workflowPath, 'deploy.yml must have a "cat > <path>" step for firebase-config.js');
  assert.ok(importPath,   'scripts/app.js must dynamically import firebase-config.js');

  // Resolve both relative to repo root
  const resolvedWorkflow = workflowPath;                        // already relative to root
  const resolvedImport   = path.join('scripts', importPath);   // relative to scripts/app.js

  assert.equal(resolvedWorkflow, resolvedImport,
    `Path mismatch — workflow writes to "${resolvedWorkflow}" but app.js imports from "${resolvedImport}"`);
});
