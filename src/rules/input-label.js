'use strict';

const { getLineNumber } = require('../utils/line-number');

// Input types that don't require a visible label
const EXEMPT_TYPES = new Set(['hidden', 'submit', 'reset', 'button', 'image']);

/** @type {Rule} */
const inputLabel = {
  id: 'input-label',
  description: 'Form controls (input, textarea, select) must have an associated label',
  severity: 'critical',
  fixable: false,

  check($, filePath, content) {
    const issues = [];

    $('input').each((_, el) => {
      const $el = $(el);
      const type = ($el.attr('type') || 'text').toLowerCase();
      if (EXEMPT_TYPES.has(type)) return;
      if (isAriaHidden($, $el)) return;
      if (!hasLabel($, $el)) {
        issues.push(makeIssue($, el, filePath, content, `input[type="${type}"]`));
      }
    });

    $('textarea').each((_, el) => {
      const $el = $(el);
      if (isAriaHidden($, $el)) return;
      if (!hasLabel($, $el)) {
        issues.push(makeIssue($, el, filePath, content, 'textarea'));
      }
    });

    $('select').each((_, el) => {
      const $el = $(el);
      if (isAriaHidden($, $el)) return;
      if (!hasLabel($, $el)) {
        issues.push(makeIssue($, el, filePath, content, 'select'));
      }
    });

    return issues;
  },
};

function hasLabel($, $el) {
  const id = $el.attr('id');
  const hasAriaLabel = $el.attr('aria-label') !== undefined && $el.attr('aria-label').trim() !== '';
  const hasAriaLabelledby = $el.attr('aria-labelledby') !== undefined;
  const hasTitle = $el.attr('title') !== undefined && $el.attr('title').trim() !== '';
  const hasLabelFor = id && $(`label[for="${id}"]`).length > 0;
  const hasWrapperLabel = $el.closest('label').length > 0;
  return hasAriaLabel || hasAriaLabelledby || hasTitle || hasLabelFor || hasWrapperLabel;
}

function isAriaHidden($, $el) {
  if ($el.attr('aria-hidden') === 'true') return true;
  if ($el.closest('[aria-hidden="true"]').length > 0) return true;
  return false;
}

function makeIssue($, el, filePath, content, elementLabel) {
  return {
    ruleId: inputLabel.id,
    severity: inputLabel.severity,
    message: `${elementLabel} has no associated label (missing label[for], wrapper <label>, aria-label, aria-labelledby, or title)`,
    filePath,
    line: getLineNumber($, el, content),
    element: $.html(el),
    fixable: inputLabel.fixable,
  };
}

module.exports = inputLabel;
