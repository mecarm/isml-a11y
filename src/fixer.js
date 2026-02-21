'use strict';

const fs = require('fs-extra');
const readline = require('readline');
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

/**
 * Interactively prompt the user for a value for each fixable issue.
 * Shows the element HTML and a clickable file path before each prompt.
 * @param {string[]} files - Array of absolute file paths
 * @param {Issue[]} issues - Issues detected before fixing
 * @returns {Promise<number>} Count of files that were modified
 */
async function applyFixesInteractive(files, issues) {
  const fixableIssues = issues.filter((i) => i.fixable);
  if (fixableIssues.length === 0) {
    console.log('\nNo fixable issues found.');
    return 0;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

  // Group fixable issues by file, preserving order
  const byFile = {};
  for (const issue of fixableIssues) {
    if (!byFile[issue.filePath]) byFile[issue.filePath] = [];
    byFile[issue.filePath].push(issue);
  }

  const SEP = '─'.repeat(60);
  let fixedCount = 0;

  for (const [filePath, fileIssues] of Object.entries(byFile)) {
    let content = await fs.readFile(filePath, 'utf8');
    let changed = false;

    for (const issue of fileIssues) {
      const rule = rules.find((r) => r.id === issue.ruleId);
      if (!rule || typeof rule.fixInteractive !== 'function') continue;

      console.log(`\n${SEP}`);
      // filePath:line is clickable in VS Code's integrated terminal (Ctrl+click)
      console.log(`File:    ${filePath}:${issue.line || 1}`);
      console.log(`Rule:    [${issue.ruleId}] ${issue.message}`);
      console.log(`Element: ${issue.element}`);
      console.log('');

      const newContent = await rule.fixInteractive(content, issue, question);
      if (newContent !== content) {
        content = newContent;
        changed = true;
      }
    }

    if (changed) {
      await fs.writeFile(filePath, content, 'utf8');
      fixedCount++;
    }
  }

  console.log(`\n${SEP}`);
  rl.close();
  return fixedCount;
}

module.exports = { applyFixes, applyFixesInteractive };
