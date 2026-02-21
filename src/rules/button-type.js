'use strict';

const { getLineNumber } = require('../utils/line-number');

/** @type {Rule} */
const buttonType = {
  id: 'button-type',
  description: '<button> elements must have a type attribute',
  severity: 'warning',
  fixable: true,

  check($, filePath, content) {
    const issues = [];

    $('button').each((_, el) => {
      const $el = $(el);
      if ($el.attr('type') === undefined) {
        issues.push({
          ruleId: buttonType.id,
          severity: buttonType.severity,
          message: 'button element is missing a type attribute (defaulting to "submit" may cause unintended form submissions)',
          filePath,
          line: getLineNumber($, el, content),
          element: $.html(el),
          fixable: buttonType.fixable,
        });
      }
    });

    return issues;
  },

  fix(content) {
    // Inject type="button" into <button> tags that don't already have a type attribute
    return content.replace(/<button\b([^>]*?)(\s*>)/gi, (match, attrs, closing) => {
      if (/\btype\s*=/i.test(attrs)) {
        return match; // already has type
      }
      return `<button${attrs} type="button"${closing}`;
    });
  },
};

module.exports = buttonType;
