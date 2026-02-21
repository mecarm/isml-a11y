'use strict';

const { getLineNumber } = require('../utils/line-number');

// Input types that don't require a visible label
const EXEMPT_TYPES = new Set(['hidden', 'submit', 'reset', 'button', 'image']);

/** @type {Rule} */
const inputLabel = {
  id: 'input-label',
  description: '<input> elements must have an associated label',
  severity: 'critical',
  fixable: false,

  check($, filePath, content) {
    const issues = [];

    $('input').each((_, el) => {
      const $el = $(el);
      const type = ($el.attr('type') || 'text').toLowerCase();

      if (EXEMPT_TYPES.has(type)) return;

      const id = $el.attr('id');
      const hasAriaLabel = $el.attr('aria-label') !== undefined;
      const hasAriaLabelledby = $el.attr('aria-labelledby') !== undefined;

      // Check for <label for="..."> pointing to this input's id
      const hasLabelFor = id && $(`label[for="${id}"]`).length > 0;

      // Check if input is wrapped in a <label>
      const hasWrapperLabel = $el.closest('label').length > 0;

      if (!hasAriaLabel && !hasAriaLabelledby && !hasLabelFor && !hasWrapperLabel) {
        issues.push({
          ruleId: inputLabel.id,
          severity: inputLabel.severity,
          message: `input[type="${type}"] has no associated label (missing label[for], wrapper <label>, aria-label, or aria-labelledby)`,
          filePath,
          line: getLineNumber($, el, content),
          element: $.html(el),
          fixable: inputLabel.fixable,
        });
      }
    });

    return issues;
  },
};

module.exports = inputLabel;
