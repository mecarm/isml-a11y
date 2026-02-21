'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const { writeJsonReport } = require('../../src/reporters/json-reporter');

function tempFile(name) {
  return path.join(os.tmpdir(), `isml-a11y-${Date.now()}-${name}`);
}

const sampleIssues = [
  { ruleId: 'img-alt', severity: 'critical', message: 'Missing alt', filePath: 'a.isml', line: 1, element: '<img>', fixable: true },
  { ruleId: 'button-type', severity: 'warning', message: 'Missing type', filePath: 'a.isml', line: 2, element: '<button>', fixable: true },
];

test('json-reporter: writes valid JSON with correct summary counts', async () => {
  const outPath = tempFile('report.json');
  await writeJsonReport(outPath, sampleIssues);

  const data = JSON.parse(await fs.readFile(outPath, 'utf8'));
  assert.equal(data.summary.total, 2);
  assert.equal(data.summary.critical, 1);
  assert.equal(data.summary.warning, 1);
  assert.equal(data.issues.length, 2);
  assert.ok(typeof data.generatedAt === 'string');

  await fs.remove(outPath);
});

test('json-reporter: preserves issue fields', async () => {
  const outPath = tempFile('report-fields.json');
  await writeJsonReport(outPath, sampleIssues);

  const data = JSON.parse(await fs.readFile(outPath, 'utf8'));
  const issue = data.issues[0];
  assert.equal(issue.ruleId, 'img-alt');
  assert.equal(issue.severity, 'critical');
  assert.equal(issue.filePath, 'a.isml');
  assert.equal(issue.line, 1);

  await fs.remove(outPath);
});

test('json-reporter: writes empty report when no issues', async () => {
  const outPath = tempFile('report-empty.json');
  await writeJsonReport(outPath, []);

  const data = JSON.parse(await fs.readFile(outPath, 'utf8'));
  assert.equal(data.summary.total, 0);
  assert.equal(data.summary.critical, 0);
  assert.equal(data.summary.warning, 0);
  assert.deepEqual(data.issues, []);

  await fs.remove(outPath);
});

test('json-reporter: creates parent directories if needed', async () => {
  const outPath = path.join(os.tmpdir(), `isml-a11y-nested-${Date.now()}`, 'deep', 'report.json');
  await writeJsonReport(outPath, []);

  const exists = await fs.pathExists(outPath);
  assert.ok(exists);

  await fs.remove(path.dirname(path.dirname(outPath)));
});

test('json-reporter: generatedAt is a valid ISO date string', async () => {
  const outPath = tempFile('report-date.json');
  await writeJsonReport(outPath, []);

  const data = JSON.parse(await fs.readFile(outPath, 'utf8'));
  assert.ok(!isNaN(Date.parse(data.generatedAt)));

  await fs.remove(outPath);
});
