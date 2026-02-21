'use strict';

const { getLineNumber } = require('../utils/line-number');

/** @type {Rule} */
const emptyLinks = {
  id: 'empty-links',
  description: '<a> elements must have accessible text',
  severity: 'critical',
  fixable: false,

  check($, filePath, content) {
    const issues = [];

    $('a').each((_, el) => {
      const $el = $(el);

      const hasAriaLabel = $el.attr('aria-label') !== undefined && $el.attr('aria-label').trim() !== '';
      const hasAriaLabelledby = $el.attr('aria-labelledby') !== undefined;
      const hasTitle = $el.attr('title') !== undefined && $el.attr('title').trim() !== '';

      // Check for visible text content (trimmed)
      const textContent = $el.text().trim();
      const hasText = textContent.length > 0;

      // Check for child img with a non-empty alt attribute
      const hasImgWithAlt = $el.find('img').toArray().some((img) => {
        const alt = $(img).attr('alt');
        return alt !== undefined && alt.trim() !== '';
      });

      if (!hasText && !hasAriaLabel && !hasAriaLabelledby && !hasTitle && !hasImgWithAlt) {
        issues.push({
          ruleId: emptyLinks.id,
          severity: emptyLinks.severity,
          message: 'Anchor element has no accessible text (missing text content, aria-label, aria-labelledby, title, or img with alt)',
          filePath,
          line: getLineNumber($, el, content),
          element: $.html(el),
          fixable: emptyLinks.fixable,
        });
      }
    });

    return issues;
  },
};

module.exports = emptyLinks;
