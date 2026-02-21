'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');

const CLI = path.resolve(__dirname, '../bin/isml-a11y.js');
const fixturesDir = path.resolve(__dirname, 'fixtures');

function run(args) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });
}

test('integration: exits with code 1 when critical issues are found', () => {
  const result = run(['check', '--path', fixturesDir]);
  assert.equal(result.status, 1);
});

test('integration: exits with code 2 on invalid path', () => {
  const result = run(['check', '--path', '/nonexistent/path/xyz']);
  assert.equal(result.status, 2);
});

test('integration: --silent suppresses all stdout', () => {
  const result = run(['check', '--path', fixturesDir, '--silent']);
  assert.equal(result.stdout, '');
});

test('integration: stdout includes scanning message by default', () => {
  const result = run(['check', '--path', fixturesDir]);
  assert.ok(result.stdout.includes('Scanning'));
});

test('integration: stdout includes issue summary', () => {
  const result = run(['check', '--path', fixturesDir]);
  assert.ok(result.stdout.includes('issue'));
});

test('integration: --report-json writes a valid JSON file', async () => {
  const outPath = path.join(os.tmpdir(), `isml-a11y-integration-${Date.now()}.json`);
  run(['check', '--path', fixturesDir, '--report-json', outPath]);

  const data = JSON.parse(await fs.readFile(outPath, 'utf8'));
  assert.ok(typeof data.summary.total === 'number');
  assert.ok(Array.isArray(data.issues));

  await fs.remove(outPath);
});

test('integration: --report-html writes a valid HTML file', async () => {
  const outPath = path.join(os.tmpdir(), `isml-a11y-integration-${Date.now()}.html`);
  run(['check', '--path', fixturesDir, '--report-html', outPath]);

  const html = await fs.readFile(outPath, 'utf8');
  assert.ok(html.includes('<!DOCTYPE html>'));

  await fs.remove(outPath);
});

test('integration: --fix repairs fixable violations in a temp file', async () => {
  const tmpDir = path.join(os.tmpdir(), `isml-a11y-fix-${Date.now()}`);
  await fs.ensureDir(tmpDir);

  const testFile = path.join(tmpDir, 'test.isml');
  await fs.writeFile(testFile, '<img src="logo.png"><button>Click</button>', 'utf8');

  run(['check', '--path', tmpDir, '--fix']);

  const fixed = await fs.readFile(testFile, 'utf8');
  assert.ok(fixed.includes('alt='), 'img should have alt after fix');
  assert.ok(fixed.includes('type='), 'button should have type after fix');

  await fs.remove(tmpDir);
});

test('integration: clean directory exits with code 0', async () => {
  const tmpDir = path.join(os.tmpdir(), `isml-a11y-clean-${Date.now()}`);
  await fs.ensureDir(tmpDir);

  const testFile = path.join(tmpDir, 'clean.isml');
  await fs.writeFile(testFile, '<img src="logo.png" alt="Logo"><button type="button">Click</button>', 'utf8');

  const result = run(['check', '--path', tmpDir]);
  assert.equal(result.status, 0);

  await fs.remove(tmpDir);
});
