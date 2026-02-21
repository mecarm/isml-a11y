'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseIsml } = require('../../src/parser');
const inputLabel = require('../../src/rules/input-label');

function check(html) {
  const $ = parseIsml(html);
  return inputLabel.check($, 'test.isml', html);
}

test('input-label: reports input with no label', () => {
  const issues = check('<input type="text" id="name">');
  assert.equal(issues.length, 1);
  assert.equal(issues[0].ruleId, 'input-label');
  assert.equal(issues[0].severity, 'critical');
  assert.equal(issues[0].fixable, false);
});

test('input-label: no issue with label[for]', () => {
  const issues = check('<label for="name">Name</label><input type="text" id="name">');
  assert.equal(issues.length, 0);
});

test('input-label: no issue with wrapper label', () => {
  const issues = check('<label>Name <input type="text"></label>');
  assert.equal(issues.length, 0);
});

test('input-label: no issue with aria-label', () => {
  const issues = check('<input type="text" aria-label="Search">');
  assert.equal(issues.length, 0);
});

test('input-label: no issue with aria-labelledby', () => {
  const issues = check('<span id="lbl">Name</span><input type="text" aria-labelledby="lbl">');
  assert.equal(issues.length, 0);
});

test('input-label: no issue for hidden input', () => {
  const issues = check('<input type="hidden" name="csrf">');
  assert.equal(issues.length, 0);
});

test('input-label: no issue for submit input', () => {
  const issues = check('<input type="submit" value="Submit">');
  assert.equal(issues.length, 0);
});

test('input-label: no issue for reset input', () => {
  const issues = check('<input type="reset" value="Reset">');
  assert.equal(issues.length, 0);
});

test('input-label: no issue for button input', () => {
  const issues = check('<input type="button" value="Click">');
  assert.equal(issues.length, 0);
});

test('input-label: reports default type (no type attribute)', () => {
  const issues = check('<input name="email">');
  assert.equal(issues.length, 1);
});

test('input-label: reports email input with no label', () => {
  const issues = check('<input type="email" name="email">');
  assert.equal(issues.length, 1);
});
