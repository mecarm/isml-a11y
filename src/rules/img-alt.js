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
      if (!$el.attr('alt') && $el.attr('alt') !== '') {
        // alt attribute is completely absent (not just empty string)
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
      }
    });

    return issues;
  },

  fix(content) {
    // Inject alt="" into <img> tags that don't already have an alt attribute
    return content.replace(/<img\b([^>]*?)(\s*\/?>)/gi, (match, attrs, closing) => {
      if (/\balt\s*=/i.test(attrs)) {
        return match; // already has alt
      }
      return `<img${attrs} alt=""${closing}`;
    });
  },
};

module.exports = imgAlt;
