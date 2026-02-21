'use strict';

const { Command } = require('commander');
const path = require('path');
const { scanFiles } = require('./scanner');
const { runRules } = require('./engine');
const { applyFixes, applyFixesInteractive } = require('./fixer');
const { writeJsonReport } = require('./reporters/json-reporter');
const { writeHtmlReport } = require('./reporters/html-reporter');

const program = new Command();

program
  .name('isml-a11y')
  .description('Accessibility scanner for ISML files')
  .version('1.0.0');

program
  .command('check')
  .description('Scan ISML files for accessibility violations')
  .requiredOption('--path <dir>', 'Directory to scan')
  .option('--fix', 'Auto-fix fixable violations with safe defaults', false)
  .option('--interactive', 'Prompt for a value for each fixable violation', false)
  .option('--report-json <file>', 'Write JSON report to file')
  .option('--report-html <file>', 'Write HTML report to file')
  .option('--silent', 'Suppress console output', false)
  .action(async (options) => {
    const scanPath = path.resolve(options.path);

    let files;
    try {
      files = await scanFiles(scanPath);
    } catch (err) {
      console.error(`Error scanning path "${scanPath}": ${err.message}`);
      process.exit(2);
    }

    if (!options.silent) {
      console.log(`Scanning ${files.length} ISML file(s) in ${scanPath}...`);
    }

    let issues;
    try {
      issues = await runRules(files);
    } catch (err) {
      console.error(`Error running rules: ${err.message}`);
      process.exit(2);
    }

    if (options.interactive) {
      if (!process.stdin.isTTY) {
        console.error('--interactive requires an interactive terminal (stdin is not a TTY).');
        process.exit(2);
      }
      try {
        const fixedCount = await applyFixesInteractive(files, issues);
        if (!options.silent && fixedCount > 0) {
          console.log(`\nFixed ${fixedCount} file(s) interactively.`);
        }
        issues = await runRules(files);
      } catch (err) {
        console.error(`Error during interactive fix: ${err.message}`);
        process.exit(2);
      }
    } else if (options.fix) {
      try {
        const fixedCount = await applyFixes(files, issues);
        if (!options.silent && fixedCount > 0) {
          console.log(`Fixed ${fixedCount} file(s).`);
        }
        issues = await runRules(files);
      } catch (err) {
        console.error(`Error applying fixes: ${err.message}`);
        process.exit(2);
      }
    }

    if (options.reportJson) {
      try {
        await writeJsonReport(options.reportJson, issues);
        if (!options.silent) {
          console.log(`JSON report written to ${options.reportJson}`);
        }
      } catch (err) {
        console.error(`Error writing JSON report: ${err.message}`);
        process.exit(2);
      }
    }

    if (options.reportHtml) {
      try {
        await writeHtmlReport(options.reportHtml, issues);
        if (!options.silent) {
          console.log(`HTML report written to ${options.reportHtml}`);
        }
      } catch (err) {
        console.error(`Error writing HTML report: ${err.message}`);
        process.exit(2);
      }
    }

    if (!options.silent) {
      printSummary(issues);
    }

    const hasCritical = issues.some((i) => i.severity === 'critical');
    process.exit(hasCritical ? 1 : 0);
  });

function printSummary(issues) {
  if (issues.length === 0) {
    console.log('\nNo accessibility issues found.');
    return;
  }

  const byFile = groupByFile(issues);
  for (const [filePath, fileIssues] of Object.entries(byFile)) {
    console.log(`\n${filePath}`);
    for (const issue of fileIssues) {
      const sev = issue.severity === 'critical' ? '[CRITICAL]' : '[WARNING] ';
      const fix = issue.fixable ? ' (fixable)' : '';
      const line = issue.line ? `:${issue.line}` : '';
      console.log(`  ${sev} line${line} — ${issue.message}${fix} [${issue.ruleId}]`);
    }
  }

  const critical = issues.filter((i) => i.severity === 'critical').length;
  const warning = issues.filter((i) => i.severity === 'warning').length;
  console.log(`\nTotal: ${issues.length} issue(s) — ${critical} critical, ${warning} warning(s)`);
}

function groupByFile(issues) {
  const groups = {};
  for (const issue of issues) {
    if (!groups[issue.filePath]) groups[issue.filePath] = [];
    groups[issue.filePath].push(issue);
  }
  return groups;
}

program.parse(process.argv);
