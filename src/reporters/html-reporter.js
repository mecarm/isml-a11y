'use strict';

const fs = require('fs-extra');

/**
 * Write a self-contained HTML report with inline CSS.
 * @param {string} outputPath - Destination file path
 * @param {Issue[]} issues - All issues found
 */
async function writeHtmlReport(outputPath, issues) {
  const critical = issues.filter((i) => i.severity === 'critical').length;
  const warning = issues.filter((i) => i.severity === 'warning').length;
  const generatedAt = new Date().toISOString();

  const byFile = groupByFile(issues);

  const fileRows = Object.entries(byFile)
    .map(([filePath, fileIssues]) => {
      const rows = fileIssues
        .map((issue) => {
          const sevClass = issue.severity === 'critical' ? 'critical' : 'warning';
          const sevLabel = issue.severity === 'critical' ? 'CRITICAL' : 'WARNING';
          const fixLabel = issue.fixable ? '<span class="fixable">fixable</span>' : '';
          const line = issue.line ? `line ${issue.line}` : '';
          const element = escapeHtml(issue.element || '');
          return `
          <tr class="${sevClass}">
            <td class="sev-badge ${sevClass}">${sevLabel}</td>
            <td>${escapeHtml(issue.ruleId)}</td>
            <td>${line}</td>
            <td>${escapeHtml(issue.message)} ${fixLabel}</td>
            <td><code>${element}</code></td>
          </tr>`;
        })
        .join('');

      return `
      <section class="file-section">
        <h2 class="file-path">${escapeHtml(filePath)}</h2>
        <table>
          <thead>
            <tr>
              <th>Severity</th>
              <th>Rule</th>
              <th>Line</th>
              <th>Message</th>
              <th>Element</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>`;
    })
    .join('');

  const noIssuesHtml =
    issues.length === 0
      ? '<p class="no-issues">No accessibility issues found.</p>'
      : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>isml-a11y Report</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; background: #f8f9fa; color: #212529; }
    h1 { font-size: 1.75rem; margin-bottom: 4px; }
    .subtitle { color: #6c757d; font-size: 0.9rem; margin-bottom: 24px; }
    .summary { display: flex; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
    .summary-card { background: #fff; border-radius: 8px; padding: 16px 24px; box-shadow: 0 1px 3px rgba(0,0,0,.12); min-width: 120px; }
    .summary-card .count { font-size: 2rem; font-weight: 700; line-height: 1; }
    .summary-card .label { font-size: 0.8rem; color: #6c757d; margin-top: 4px; }
    .count.total { color: #343a40; }
    .count.critical { color: #dc3545; }
    .count.warning { color: #fd7e14; }
    .file-section { background: #fff; border-radius: 8px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,.12); overflow: hidden; }
    .file-path { font-size: 0.9rem; font-family: monospace; background: #343a40; color: #f8f9fa; margin: 0; padding: 10px 16px; word-break: break-all; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f1f3f5; text-align: left; padding: 10px 12px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #495057; }
    td { padding: 10px 12px; border-bottom: 1px solid #e9ecef; font-size: 0.875rem; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    tr.critical { background: #fff5f5; }
    tr.warning { background: #fff9f0; }
    .sev-badge { font-weight: 700; font-size: 0.75rem; white-space: nowrap; }
    .sev-badge.critical { color: #dc3545; }
    .sev-badge.warning { color: #fd7e14; }
    .fixable { display: inline-block; background: #d3f9d8; color: #2b8a3e; border-radius: 4px; padding: 1px 6px; font-size: 0.75rem; margin-left: 4px; }
    code { font-size: 0.8rem; background: #f1f3f5; padding: 2px 4px; border-radius: 3px; word-break: break-all; }
    .no-issues { text-align: center; padding: 48px; color: #2b8a3e; font-size: 1.1rem; font-weight: 600; }
  </style>
</head>
<body>
  <h1>isml-a11y Accessibility Report</h1>
  <p class="subtitle">Generated at ${generatedAt}</p>
  <div class="summary">
    <div class="summary-card"><div class="count total">${issues.length}</div><div class="label">Total Issues</div></div>
    <div class="summary-card"><div class="count critical">${critical}</div><div class="label">Critical</div></div>
    <div class="summary-card"><div class="count warning">${warning}</div><div class="label">Warnings</div></div>
  </div>
  ${noIssuesHtml}
  ${fileRows}
</body>
</html>`;

  await fs.outputFile(outputPath, html, 'utf8');
}

function groupByFile(issues) {
  const groups = {};
  for (const issue of issues) {
    if (!groups[issue.filePath]) groups[issue.filePath] = [];
    groups[issue.filePath].push(issue);
  }
  return groups;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { writeHtmlReport };
