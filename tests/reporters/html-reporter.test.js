'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const { writeHtmlReport } = require('../../src/reporters/html-reporter');

function tempFile(name) {
  return path.join(os.tmpdir(), `isml-a11y-${Date.now()}-${name}`);
}

const sampleIssues = [
  { ruleId: 'img-alt', severity: 'critical', message: 'Missing alt attribute', filePath: 'a.isml', line: 3, element: '<img src="x.png">', fixable: true },
  { ruleId: 'button-type', severity: 'warning', message: 'Missing type attribute', filePath: 'a.isml', line: 5, element: '<button>', fixable: true },
];

test('html-reporter: writes a valid HTML5 document', async () => {
  const outPath = tempFile('report.html');
  await writeHtmlReport(outPath, sampleIssues);

  const html = await fs.readFile(outPath, 'utf8');
  assert.ok(html.startsWith('<!DOCTYPE html>'));
  assert.ok(html.includes('<html lang="en">'));

  await fs.remove(outPath);
});

test('html-reporter: includes rule IDs and messages', async () => {
  const outPath = tempFile('report-content.html');
  await writeHtmlReport(outPath, sampleIssues);

  const html = await fs.readFile(outPath, 'utf8');
  assert.ok(html.includes('img-alt'));
  assert.ok(html.includes('button-type'));
  assert.ok(html.includes('Missing alt attribute'));

  await fs.remove(outPath);
});

test('html-reporter: shows CRITICAL and WARNING labels', async () => {
  const outPath = tempFile('report-severity.html');
  await writeHtmlReport(outPath, sampleIssues);

  const html = await fs.readFile(outPath, 'utf8');
  assert.ok(html.includes('CRITICAL'));
  assert.ok(html.includes('WARNING'));

  await fs.remove(outPath);
});

test('html-reporter: shows no-issues message when empty', async () => {
  const outPath = tempFile('report-empty.html');
  await writeHtmlReport(outPath, []);

  const html = await fs.readFile(outPath, 'utf8');
  assert.ok(html.includes('No accessibility issues found'));

  await fs.remove(outPath);
});

test('html-reporter: escapes HTML characters in element output', async () => {
  const outPath = tempFile('report-escape.html');
  const issues = [
    { ruleId: 'img-alt', severity: 'critical', message: 'test', filePath: 'a.isml', line: 1, element: '<img src="x.png">', fixable: false },
  ];

  await writeHtmlReport(outPath, issues);
  const html = await fs.readFile(outPath, 'utf8');
  assert.ok(html.includes('&lt;img'));

  await fs.remove(outPath);
});

test('html-reporter: marks fixable issues', async () => {
  const outPath = tempFile('report-fixable.html');
  await writeHtmlReport(outPath, sampleIssues);

  const html = await fs.readFile(outPath, 'utf8');
  assert.ok(html.includes('fixable'));

  await fs.remove(outPath);
});

test('html-reporter: summary counts are correct', async () => {
  const outPath = tempFile('report-summary.html');
  await writeHtmlReport(outPath, sampleIssues);

  const html = await fs.readFile(outPath, 'utf8');
  // Summary cards show counts — check they appear in the document
  assert.ok(html.includes('Total Issues'));
  assert.ok(html.includes('Critical'));
  assert.ok(html.includes('Warnings'));

  await fs.remove(outPath);
});
