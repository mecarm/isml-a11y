'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseIsml } = require('../../src/parser');
const imgAlt = require('../../src/rules/img-alt');

function check(html) {
  const $ = parseIsml(html);
  return imgAlt.check($, 'test.isml', html);
}

test('img-alt: reports missing alt attribute', () => {
  const issues = check('<img src="logo.png">');
  assert.equal(issues.length, 1);
  assert.equal(issues[0].ruleId, 'img-alt');
  assert.equal(issues[0].severity, 'critical');
  assert.equal(issues[0].fixable, true);
});

test('img-alt: no issue when alt is present', () => {
  const issues = check('<img src="logo.png" alt="Company logo">');
  assert.equal(issues.length, 0);
});

test('img-alt: no issue when alt is empty string', () => {
  const issues = check('<img src="decorative.png" alt="">');
  assert.equal(issues.length, 0);
});

test('img-alt: reports multiple missing alts', () => {
  const issues = check('<img src="a.png"><img src="b.png">');
  assert.equal(issues.length, 2);
});

test('img-alt: fix adds alt="" to img without alt', () => {
  const input = '<img src="logo.png">';
  const fixed = imgAlt.fix(input);
  assert.match(fixed, /alt=""/);
});

test('img-alt: fix preserves existing alt', () => {
  const input = '<img src="logo.png" alt="logo">';
  const fixed = imgAlt.fix(input);
  assert.equal(fixed, input);
});

test('img-alt: fix handles self-closing img', () => {
  const input = '<img src="logo.png" />';
  const fixed = imgAlt.fix(input);
  assert.match(fixed, /alt=""/);
});

test('img-alt: fix handles img with multiple attributes', () => {
  const input = '<img src="logo.png" class="hero-img" width="100">';
  const fixed = imgAlt.fix(input);
  assert.match(fixed, /alt=""/);
  assert.match(fixed, /src="logo\.png"/);
  assert.match(fixed, /class="hero-img"/);
});
