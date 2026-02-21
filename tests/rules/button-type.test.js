'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseIsml } = require('../../src/parser');
const buttonType = require('../../src/rules/button-type');

function check(html) {
  const $ = parseIsml(html);
  return buttonType.check($, 'test.isml', html);
}

test('button-type: reports missing type attribute', () => {
  const issues = check('<button>Click me</button>');
  assert.equal(issues.length, 1);
  assert.equal(issues[0].ruleId, 'button-type');
  assert.equal(issues[0].severity, 'warning');
  assert.equal(issues[0].fixable, true);
});

test('button-type: no issue when type="button"', () => {
  const issues = check('<button type="button">Click me</button>');
  assert.equal(issues.length, 0);
});

test('button-type: no issue when type="submit"', () => {
  const issues = check('<button type="submit">Submit</button>');
  assert.equal(issues.length, 0);
});

test('button-type: no issue when type="reset"', () => {
  const issues = check('<button type="reset">Reset</button>');
  assert.equal(issues.length, 0);
});

test('button-type: reports multiple missing types', () => {
  const issues = check('<button>A</button><button>B</button>');
  assert.equal(issues.length, 2);
});

test('button-type: fix adds type="button" to button without type', () => {
  const input = '<button>Click</button>';
  const fixed = buttonType.fix(input);
  assert.match(fixed, /type="button"/);
});

test('button-type: fix preserves existing type', () => {
  const input = '<button type="submit">Submit</button>';
  const fixed = buttonType.fix(input);
  assert.equal(fixed, input);
});

test('button-type: fix handles button with existing attributes', () => {
  const input = '<button class="btn btn-primary" id="save-btn">Save</button>';
  const fixed = buttonType.fix(input);
  assert.match(fixed, /type="button"/);
  assert.match(fixed, /class="btn btn-primary"/);
});
