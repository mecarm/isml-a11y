'use strict';

const fs = require('fs-extra');
const rules = require('./rules/index');

/**
 * Apply auto-fixes to files that have fixable issues.
 * @param {string[]} files - Array of absolute file paths
 * @param {Issue[]} issues - Issues detected before fixing
 * @returns {Promise<number>} Count of files that were modified
 */
async function applyFixes(files, issues) {
  const fixableFiles = new Set(
    issues.filter((i) => i.fixable).map((i) => i.filePath)
  );

  const fixableRules = rules.filter((r) => r.fixable);
  let fixedCount = 0;

  for (const filePath of files) {
    if (!fixableFiles.has(filePath)) continue;

    let content = await fs.readFile(filePath, 'utf8');
    let changed = false;

    for (const rule of fixableRules) {
      if (typeof rule.fix === 'function') {
        const fixed = rule.fix(content);
        if (fixed !== content) {
          content = fixed;
          changed = true;
        }
      }
    }

    if (changed) {
      await fs.writeFile(filePath, content, 'utf8');
      fixedCount++;
    }
  }

  return fixedCount;
}

module.exports = { applyFixes };
