'use strict';

const { getLineNumber } = require('../utils/line-number');

/** @type {Rule} */
const imgAlt = {
  id: 'img-alt',
  description: '<img> elements must have an alt attribute',
  severity: 'critical',
  fixable: true,

  check($, filePath, content) {
    const issues = [];

    $('img').each((_, el) => {
      const $el = $(el);
      if ($el.attr('alt') === undefined) {
        issues.push({
          ruleId: imgAlt.id,
          severity: imgAlt.severity,
          message: 'img element is missing an alt attribute',
          filePath,
          line: getLineNumber($, el, content),
          element: $.html(el),
          fixable: imgAlt.fixable,
        });
      }
    });

    return issues;
  },

  fix(content) {
    return content.replace(/<img\b([^>]*?)(\s*\/?>)/gi, (match, attrs, closing) => {
      if (/\balt\s*=/i.test(attrs)) return match;
      return `<img${attrs} alt=""${closing}`;
    });
  },

  async fixInteractive(content, issue, question) {
    const answer = await question('  Alt text (press Enter to mark as decorative with alt=""): ');
    const altValue = answer.trim();
    const elementHtml = issue.element;
    const fixed = elementHtml.replace(/(\s*\/?>)$/, ` alt="${altValue}"$1`);
    if (fixed === elementHtml) return content;
    const updated = content.replace(elementHtml, fixed);
    if (updated === content) {
      console.log('  Warning: could not locate element in file — skipping.');
      return content;
    }
    return updated;
  },
};

module.exports = imgAlt;
