# Roadmap

This document tracks planned improvements and future directions for `isml-a11y`.

---

## Current — v1.0.0 (released)

- Recursive `.isml` file scanning
- 4 accessibility rules: `img-alt`, `button-type`, `input-label`, `empty-links`
- Auto-fix for safe rules (`img-alt`, `button-type`)
- Interactive fix mode (`--interactive`) with per-issue prompts
- JSON and HTML report generation
- CI-compatible exit codes
- 79 unit, reporter, and integration tests

---

## Next — v1.1.0 (real-world validation)

- Test against real Salesforce B2C Commerce cartridges
- Tune rules based on patterns found in production ISML templates
- Fix any edge cases discovered during real-world usage
- Evaluate publishing to npm registry

---

## Future — HTML support

Minimal work needed since cheerio already parses HTML natively.

- Extend the scanner to detect `**/*.html` files
- Add a `--type` flag (`isml`, `html`, `all`) so users can control which file types are scanned
- All existing rules, reporters, and CLI options work without changes

---

## Future — React (JSX/TSX) support

More complex — cheerio cannot parse JSX syntax. Planned approach:

- Introduce `@babel/parser` as an optional parser for `.jsx` and `.tsx` files
- Traverse the Babel AST instead of using cheerio CSS selectors
- Rules will need a second implementation that operates on AST nodes rather than cheerio elements
- The engine, reporters, CLI, fixer, and exit code logic remain untouched

The accessibility rules themselves (what to check) stay identical — only the parser and element query layer changes.

---

## Ideas under consideration

- Configuration file support (`.isml-a11yrc`) to enable/disable rules per project and exclude specific paths
- Additional rules: `aria-roles`, `lang-attribute`, `duplicate-id`, `color-contrast` (where detectable statically)
- VS Code extension for inline highlighting of violations while editing
