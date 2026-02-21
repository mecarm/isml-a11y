'use strict';

const fs = require('fs-extra');
const { parseIsml } = require('./parser');
const rules = require('./rules/index');

/**
 * Run all rules against a list of ISML files.
 * @param {string[]} files - Array of absolute file paths
 * @returns {Promise<Issue[]>} Flat array of all issues found
 */
async function runRules(files) {
  const allIssues = [];

  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf8');
    const $ = parseIsml(content);

    for (const rule of rules) {
      const issues = rule.check($, filePath, content);
      allIssues.push(...issues);
    }
  }

  return allIssues;
}

module.exports = { runRules };
