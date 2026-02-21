'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { scanFiles } = require('../src/scanner');

const fixturesDir = path.resolve(__dirname, 'fixtures');

test('scanner: finds .isml files in fixtures directory', async () => {
  const files = await scanFiles(fixturesDir);
  assert.ok(files.length > 0, 'Should find at least one .isml file');
  assert.ok(files.every((f) => f.endsWith('.isml')), 'All results should be .isml files');
});

test('scanner: returns absolute paths', async () => {
  const files = await scanFiles(fixturesDir);
  assert.ok(files.every((f) => path.isAbsolute(f)), 'All paths should be absolute');
});

test('scanner: throws on non-existent path', async () => {
  await assert.rejects(
    () => scanFiles('/nonexistent/path/that/does/not/exist'),
    (err) => {
      assert.ok(err instanceof Error);
      return true;
    }
  );
});

test('scanner: throws on file path (not a directory)', async () => {
  const filePath = path.join(fixturesDir, 'sample.isml');
  await assert.rejects(
    () => scanFiles(filePath),
    (err) => {
      assert.ok(err instanceof Error);
      return true;
    }
  );
});
