'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseIsml } = require('../../src/parser');
const inputLabel = require('../../src/rules/input-label');

function check(html) {
  const $ = parseIsml(html);
  return inputLabel.check($, 'test.isml', html);
}

// --- input ---

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

test('input-label: no issue with title attribute', () => {
  const issues = check('<input type="text" title="Enter your name">');
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

test('input-label: skips input with aria-hidden="true"', () => {
  const issues = check('<input type="text" aria-hidden="true">');
  assert.equal(issues.length, 0);
});

test('input-label: skips input inside aria-hidden container', () => {
  const issues = check('<div aria-hidden="true"><input type="text"></div>');
  assert.equal(issues.length, 0);
});

// --- textarea ---

test('input-label: reports textarea with no label', () => {
  const issues = check('<textarea name="bio"></textarea>');
  assert.equal(issues.length, 1);
  assert.equal(issues[0].ruleId, 'input-label');
  assert.equal(issues[0].severity, 'critical');
});

test('input-label: no issue for textarea with label[for]', () => {
  const issues = check('<label for="bio">Bio</label><textarea id="bio"></textarea>');
  assert.equal(issues.length, 0);
});

test('input-label: no issue for textarea with aria-label', () => {
  const issues = check('<textarea aria-label="Your message"></textarea>');
  assert.equal(issues.length, 0);
});

test('input-label: no issue for textarea with title', () => {
  const issues = check('<textarea title="Enter your bio"></textarea>');
  assert.equal(issues.length, 0);
});

test('input-label: no issue for textarea inside wrapper label', () => {
  const issues = check('<label>Bio <textarea></textarea></label>');
  assert.equal(issues.length, 0);
});

test('input-label: skips textarea with aria-hidden="true"', () => {
  const issues = check('<textarea aria-hidden="true"></textarea>');
  assert.equal(issues.length, 0);
});

// --- select ---

test('input-label: reports select with no label', () => {
  const issues = check('<select name="country"><option>US</option></select>');
  assert.equal(issues.length, 1);
  assert.equal(issues[0].ruleId, 'input-label');
  assert.equal(issues[0].severity, 'critical');
});

test('input-label: no issue for select with label[for]', () => {
  const issues = check('<label for="country">Country</label><select id="country"><option>US</option></select>');
  assert.equal(issues.length, 0);
});

test('input-label: no issue for select with aria-label', () => {
  const issues = check('<select aria-label="Select country"><option>US</option></select>');
  assert.equal(issues.length, 0);
});

test('input-label: no issue for select with title', () => {
  const issues = check('<select title="Choose a country"><option>US</option></select>');
  assert.equal(issues.length, 0);
});

test('input-label: no issue for select inside wrapper label', () => {
  const issues = check('<label>Country <select><option>US</option></select></label>');
  assert.equal(issues.length, 0);
});

test('input-label: skips select with aria-hidden="true"', () => {
  const issues = check('<select aria-hidden="true"><option>US</option></select>');
  assert.equal(issues.length, 0);
});
