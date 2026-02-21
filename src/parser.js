'use strict';

const cheerio = require('cheerio');

/**
 * Parse ISML content with cheerio using ISML-safe options.
 * - xmlMode: false — treat as HTML so void elements are handled correctly
 * - decodeEntities: false — preserve ISML expressions like ${...} and <isprint ...>
 * @param {string} content - Raw ISML file content
 * @returns {CheerioAPI} Loaded cheerio instance
 */
function parseIsml(content) {
  return cheerio.load(content, {
    xmlMode: false,
    decodeEntities: false,
    lowerCaseTags: false,
    lowerCaseAttributeNames: false,
  });
}

module.exports = { parseIsml };
