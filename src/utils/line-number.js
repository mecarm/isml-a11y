'use strict';

/**
 * Find the 1-based line number of an element in the raw source.
 * Uses cheerio's $.html(el) to get the element's HTML, then searches
 * for it in the raw content. Falls back to 0 if not found (cheerio
 * may normalize whitespace, making exact match impossible).
 *
 * @param {CheerioAPI} $ - Loaded cheerio instance
 * @param {CheerioElement} el - The element to locate
 * @param {string} content - Raw file content
 * @returns {number} 1-based line number, or 0 if not found
 */
function getLineNumber($, el, content) {
  try {
    const html = $.html(el);
    const idx = content.indexOf(html);
    if (idx === -1) {
      // Try matching just the opening tag
      const outerHtml = $.html(el);
      const tagMatch = outerHtml.match(/^<[^>]+>/);
      if (tagMatch) {
        const tagIdx = content.indexOf(tagMatch[0]);
        if (tagIdx !== -1) {
          return content.slice(0, tagIdx).split('\n').length;
        }
      }
      return 0;
    }
    return content.slice(0, idx).split('\n').length;
  } catch {
    return 0;
  }
}

module.exports = { getLineNumber };
