'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseIsml } = require('../../src/parser');
const emptyLinks = require('../../src/rules/empty-links');

function check(html) {
  const $ = parseIsml(html);
  return emptyLinks.check($, 'test.isml', html);
}

test('empty-links: reports anchor with no content', () => {
  const issues = check('<a href="/home"></a>');
  assert.equal(issues.length, 1);
  assert.equal(issues[0].ruleId, 'empty-links');
  assert.equal(issues[0].severity, 'critical');
  assert.equal(issues[0].fixable, false);
});

test('empty-links: no issue with text content', () => {
  const issues = check('<a href="/home">Home</a>');
  assert.equal(issues.length, 0);
});

test('empty-links: no issue with aria-label', () => {
  const issues = check('<a href="/home" aria-label="Go to home page"></a>');
  assert.equal(issues.length, 0);
});

test('empty-links: no issue with aria-labelledby', () => {
  const issues = check('<span id="lnk-label">Home</span><a href="/home" aria-labelledby="lnk-label"></a>');
  assert.equal(issues.length, 0);
});

test('empty-links: no issue with title attribute', () => {
  const issues = check('<a href="/home" title="Go home"></a>');
  assert.equal(issues.length, 0);
});

test('empty-links: no issue with img child having alt', () => {
  const issues = check('<a href="/home"><img src="logo.png" alt="Home"></a>');
  assert.equal(issues.length, 0);
});

test('empty-links: reports link with img but no alt', () => {
  const issues = check('<a href="/home"><img src="logo.png" alt=""></a>');
  assert.equal(issues.length, 1);
});

test('empty-links: reports link with only whitespace text', () => {
  const issues = check('<a href="/home">   </a>');
  assert.equal(issues.length, 1);
});

test('empty-links: no issue with empty aria-label is still flagged', () => {
  // aria-label present but empty should still be flagged
  const issues = check('<a href="/home" aria-label=""></a>');
  assert.equal(issues.length, 1);
});

test('empty-links: skips anchor with aria-hidden="true"', () => {
  const issues = check('<a href="/home" aria-hidden="true"></a>');
  assert.equal(issues.length, 0);
});

test('empty-links: skips anchor inside aria-hidden container', () => {
  const issues = check('<div aria-hidden="true"><a href="/home"></a></div>');
  assert.equal(issues.length, 0);
});

test('empty-links: still reports non-hidden anchor alongside hidden one', () => {
  const issues = check('<a href="/home" aria-hidden="true"></a><a href="/about"></a>');
  assert.equal(issues.length, 1);
  assert.equal(issues[0].ruleId, 'empty-links');
});
