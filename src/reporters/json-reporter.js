'use strict';

const fs = require('fs-extra');

/**
 * Write a structured JSON report to disk.
 * @param {string} outputPath - Destination file path
 * @param {Issue[]} issues - All issues found
 */
async function writeJsonReport(outputPath, issues) {
  const critical = issues.filter((i) => i.severity === 'critical').length;
  const warning = issues.filter((i) => i.severity === 'warning').length;

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      total: issues.length,
      critical,
      warning,
    },
    issues,
  };

  await fs.outputFile(outputPath, JSON.stringify(report, null, 2), 'utf8');
}

module.exports = { writeJsonReport };
