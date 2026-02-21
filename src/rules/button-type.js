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
    return content.replace(/<button\b([^>]*?)(\s*>)/gi, (match, attrs, closing) => {
      if (/\btype\s*=/i.test(attrs)) return match;
      return `<button${attrs} type="button"${closing}`;
    });
  },

  async fixInteractive(content, issue, question) {
    const answer = await question('  Button type (button/submit/reset) [button]: ');
    const typeValue = answer.trim() || 'button';
    const elementHtml = issue.element;
    // Add type only to the opening tag
    const fixed = elementHtml.replace(/^(<button\b[^>]*)>/, `$1 type="${typeValue}">`);
    if (fixed === elementHtml) return content;
    const updated = content.replace(elementHtml, fixed);
    if (updated === content) {
      console.log('  Warning: could not locate element in file — skipping.');
      return content;
    }
    return updated;
  },
};

module.exports = buttonType;
