# isml-a11y — Usage Guide

This guide explains every scenario you will encounter when using `isml-a11y`. It is written for developers who are new to the tool.

---

## Table of Contents

1. [What this tool does](#1-what-this-tool-does)
2. [Installation](#2-installation)
3. [Running a basic scan](#3-running-a-basic-scan)
4. [Reading the output](#4-reading-the-output)
5. [Auto-fixing issues](#5-auto-fixing-issues)
6. [Interactive fix mode](#6-interactive-fix-mode)
7. [Generating a JSON report](#7-generating-a-json-report)
8. [Generating an HTML report](#8-generating-an-html-report)
9. [Combining options](#9-combining-options)
10. [Running silently (for CI pipelines)](#10-running-silently-for-ci-pipelines)
11. [Exit codes](#11-exit-codes)
12. [Rules reference](#12-rules-reference)
13. [What to do with non-fixable issues](#13-what-to-do-with-non-fixable-issues)

---

## 1. What this tool does

`isml-a11y` scans `.isml` files (Salesforce B2C Commerce templates) and reports **accessibility violations** — things that make a page harder or impossible to use for people who rely on screen readers, keyboard navigation, or other assistive technology.

It does **not** modify your code unless you explicitly tell it to with the `--fix` flag.

---

## 2. Installation

**Option A — Clone from GitHub** (current method while npm package is not yet published):

If you just want to use the tool without contributing, clone it directly:

```bash
git clone https://github.com/mecarm/isml-a11y.git
cd isml-a11y
npm install
```

If you want to make changes and contribute back, **fork it first**:

1. Go to `https://github.com/mecarm/isml-a11y`
2. Click the **Fork** button (top right) — this creates a copy under your own GitHub account
3. Clone your fork instead:

```bash
git clone https://github.com/YOUR-USERNAME/isml-a11y.git
cd isml-a11y
npm install
```

With a fork you can freely make changes, push to your own copy, and open a Pull Request to propose your changes back to the original repo.

Once cloned, run every command using `node bin/isml-a11y.js` instead of `isml-a11y`:

```bash
# Instead of: isml-a11y check --path ./cartridges
node bin/isml-a11y.js check --path ./cartridges
```

All examples in this guide use the `isml-a11y` shorthand. If you cloned the repo, just replace it with `node bin/isml-a11y.js` and everything works the same.

> **Windows note:** if you get a script execution error when running `npm install`, run this first in PowerShell:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```
> Then run `npm install` again.

---

**Option B — Install globally** (available once published to npm):

```bash
npm install -g isml-a11y
```

After this you can type `isml-a11y` from any folder in your terminal.

**Option C — Install locally** (available once published to npm):

```bash
npm install isml-a11y
```

With a local install, prefix commands with `npx`:

```bash
npx isml-a11y check --path ./cartridges
```

---

## 3. Running a basic scan

The only required option is `--path`. Point it at the folder that contains your `.isml` files. The tool will search all subfolders automatically.

```bash
isml-a11y check --path ./cartridges
```

```bash
# Example with a deeper path
isml-a11y check --path ./cartridges/app_storefront_base/cartridge/templates
```

The tool will:
1. Find every `.isml` file inside that folder (recursively)
2. Check each file against all accessibility rules
3. Print a summary to your terminal
4. Exit with a code that tells you whether issues were found

---

## 4. Reading the output

A typical output looks like this:

```
Scanning 12 ISML file(s) in /project/cartridges...

/project/cartridges/templates/default/product/productTile.isml
  [CRITICAL] line:14 — img element is missing an alt attribute (fixable) [img-alt]
  [CRITICAL] line:31 — Anchor element has no accessible text [empty-links]

/project/cartridges/templates/default/checkout/billing.isml
  [CRITICAL] line:8  — input[type="text"] has no associated label [input-label]
  [WARNING]  line:22 — button element is missing a type attribute (fixable) [button-type]

Total: 4 issue(s) — 3 critical, 1 warning(s)
```

Here is what each part means:

| Part | Meaning |
|------|---------|
| `[CRITICAL]` | A serious accessibility violation. Must be fixed. |
| `[WARNING]` | A best-practice issue. Should be fixed. |
| `line:14` | The line number in the file where the problem was found. |
| `(fixable)` | The tool can fix this automatically with `--fix`. |
| `[img-alt]` | The name of the rule that flagged the issue. |

---

## 5. Auto-fixing issues

Some issues are safe to fix automatically. Add the `--fix` flag and the tool will rewrite the affected files for you.

```bash
isml-a11y check --path ./cartridges --fix
```

**What gets fixed automatically:**

| Rule | What the fix does |
|------|------------------|
| `img-alt` | Adds `alt=""` to every `<img>` that is missing the attribute |
| `button-type` | Adds `type="button"` to every `<button>` that is missing the attribute |

**Important:** The auto-fix inserts a safe default value (`alt=""` or `type="button"`). You should review the changes afterward:

- `alt=""` tells screen readers the image is decorative and should be ignored. If the image actually conveys meaning (like a product photo), you need to write a real description manually, e.g. `alt="Blue running shoes, size 10"`.
- `type="button"` prevents the button from accidentally submitting a form. This is correct for most buttons.

**After running `--fix`, run the scan again** to confirm remaining issues:

```bash
isml-a11y check --path ./cartridges --fix
isml-a11y check --path ./cartridges
```

---

## 6. Interactive fix mode

Use `--interactive` when you want to decide the correct value for each fixable issue yourself, instead of accepting the automatic default.

```bash
node bin/isml-a11y.js check --path ./cartridges --interactive
```

For every fixable issue the tool will pause and show you:
- The **exact file path and line number** — clickable in VS Code's integrated terminal (Ctrl+click) to jump straight to the problem
- The **rule** that was violated and why
- The **full element HTML** so you have context
- A **prompt** asking for the value to set

Example session:

```
────────────────────────────────────────────────────────────
File:    C:\project\cartridges\templates\productTile.isml:14
Rule:    [img-alt] img element is missing an alt attribute
Element: <img src="${tile.image}" class="product-img">

  Alt text (press Enter to mark as decorative with alt=""): Product image for ${tile.name}

────────────────────────────────────────────────────────────
File:    C:\project\cartridges\templates\checkout.isml:22
Rule:    [button-type] button element is missing a type attribute
Element: <button class="btn-primary">Place Order</button>

  Button type (button/submit/reset) [button]: submit

────────────────────────────────────────────────────────────

Fixed 2 file(s) interactively.
```

**Tips:**
- For `img-alt`: press Enter with no input to insert `alt=""` (marks the image as decorative)
- For `button-type`: press Enter with no input to default to `type="button"`; type `submit` if the button submits a form
- `--interactive` requires a real terminal — it will not work in CI pipelines (use `--fix` there instead)

## 7. Generating a JSON report

Use `--report-json` followed by a file path to save the results as a JSON file. This is useful for storing results, sending them to another system, or processing them with a script.

```bash
isml-a11y check --path ./cartridges --report-json report.json
```

The file will look like this:

```json
{
  "generatedAt": "2024-11-15T10:30:00.000Z",
  "summary": {
    "total": 4,
    "critical": 3,
    "warning": 1
  },
  "issues": [
    {
      "ruleId": "img-alt",
      "severity": "critical",
      "message": "img element is missing an alt attribute",
      "filePath": "/project/cartridges/templates/productTile.isml",
      "line": 14,
      "element": "<img src=\"${tile.image}\" class=\"product-img\">",
      "fixable": true
    }
  ]
}
```

The parent folder for the file will be created automatically if it does not exist:

```bash
isml-a11y check --path ./cartridges --report-json ./reports/accessibility/report.json
```

---

## 8. Generating an HTML report

Use `--report-html` to save a self-contained HTML file you can open in any browser. This is useful for sharing results with designers, project managers, or QA teams.

```bash
isml-a11y check --path ./cartridges --report-html report.html
```

Then open `report.html` in your browser. The report includes:
- A summary card showing total, critical, and warning counts
- A table per file listing every issue, its severity, the line number, and the offending HTML element
- Color coding (red for critical, orange for warning)
- A "fixable" badge on issues that can be auto-fixed

---

## 9. Combining options

All options can be combined freely in a single command.

**Scan, fix, and generate both reports:**

```bash
isml-a11y check --path ./cartridges --fix --report-json report.json --report-html report.html
```

**Scan silently and only produce a JSON report (useful in CI):**

```bash
isml-a11y check --path ./cartridges --silent --report-json report.json
```

**Fix and then verify what remains:**

```bash
# Step 1: fix what can be fixed, generate a report of what is left
isml-a11y check --path ./cartridges --fix --report-html report.html
```

---

## 10. Running silently (for CI pipelines)

Add `--silent` to suppress all terminal output. The tool will still exit with the correct code, so your CI pipeline will still fail when issues are found.

```bash
isml-a11y check --path ./cartridges --silent
```

A typical CI step (e.g. in a `package.json` script or pipeline YAML) looks like this:

```bash
isml-a11y check --path ./cartridges --silent --report-json accessibility-report.json
```

If the command exits with code `1`, the pipeline fails and you can attach `accessibility-report.json` as a build artifact for review.

---

## 11. Exit codes

The tool always exits with one of these three codes:

| Code | Meaning | When it happens |
|------|---------|-----------------|
| `0` | Pass | No critical issues found |
| `1` | Fail | One or more critical issues found |
| `2` | Error | Something went wrong (e.g. the path does not exist) |

> **Note:** Warnings do **not** cause an exit code of `1`. Only critical issues do. This means a project with only warnings will still exit `0`.

You can check the exit code manually in your terminal after running the tool:

```bash
# On Mac/Linux
echo $?

# On Windows PowerShell
echo $LASTEXITCODE
```

---

## 12. Rules reference

### `img-alt` — Critical — Fixable

Every `<img>` element must have an `alt` attribute.

**Why it matters:** Screen readers announce images to blind users using the `alt` text. Without it, the user has no idea what the image shows.

**Bad:**
```html
<img src="${URLUtils.staticURL('images/logo.png')}" class="logo">
```

**Good — meaningful image:**
```html
<img src="${URLUtils.staticURL('images/logo.png')}" class="logo" alt="My Store logo">
```

**Good — decorative image (intentionally hidden from screen readers):**
```html
<img src="${URLUtils.staticURL('images/divider.png')}" alt="">
```

> The auto-fix adds `alt=""`. If the image is meaningful, update the value to a real description after running `--fix`.

---

### `button-type` — Warning — Fixable

Every `<button>` element must have a `type` attribute (`button`, `submit`, or `reset`).

**Why it matters:** Browsers default a `<button>` without a `type` to `type="submit"`. Inside a form, this means clicking any untyped button submits the form — which is often not what you want.

**Bad:**
```html
<button class="btn-primary" id="add-to-cart">Add to Cart</button>
```

**Good:**
```html
<!-- For a button that does NOT submit a form -->
<button type="button" class="btn-primary" id="add-to-cart">Add to Cart</button>

<!-- For a button that intentionally submits a form -->
<button type="submit" class="btn-checkout">Checkout</button>
```

> The auto-fix adds `type="button"`. Change it to `type="submit"` if the button is meant to submit a form.

---

### `input-label` — Critical — Not fixable

Every `<input>`, `<textarea>`, and `<select>` element must have an associated label so users know what information to enter.

**Why it matters:** Without a label, a screen reader user hears "edit text" with no context. They do not know if they are filling in their name, email, or a search query.

There are four accepted ways to associate a label:

**Option 1 — `<label>` with a `for` attribute (most common):**
```html
<label for="email">Email address</label>
<input type="email" id="email" name="email">
```

**Option 2 — Input wrapped inside a `<label>`:**
```html
<label>
  Email address
  <input type="email" name="email">
</label>
```

**Option 3 — `aria-label` directly on the element:**
```html
<input type="search" aria-label="Search products" name="q">
<textarea aria-label="Your message"></textarea>
<select aria-label="Select your country"></select>
```

**Option 4 — `title` attribute:**
```html
<input type="text" title="Enter your full name" name="name">
```

**Exempt input types** — these do not need labels because they are not visible to the user or they carry their own label:

| Type | Reason |
|------|--------|
| `hidden` | Not visible at all |
| `submit` | Its `value` attribute is the label |
| `reset` | Its `value` attribute is the label |
| `button` | Its `value` attribute is the label |
| `image` | Uses `alt` instead |

**Note:** Elements with `aria-hidden="true"` are also skipped — they are intentionally invisible to assistive technology.

> This rule cannot be auto-fixed because the tool cannot know what the correct label text should be. You must write the label yourself.

---

### `empty-links` — Critical — Not fixable

Every `<a>` element must have accessible text so users know where the link goes.

**Why it matters:** Screen readers announce links by their text. A link with no text is announced as "link" with no destination — useless for navigation.

**Bad:**
```html
<a href="${tile.compareUrl}"></a>
<a href="/cart"><img src="cart-icon.svg" alt=""></a>
```

**Good — text content:**
```html
<a href="/cart">View cart</a>
```

**Good — image link with descriptive alt:**
```html
<a href="/cart"><img src="cart-icon.svg" alt="View cart"></a>
```

**Good — icon link with aria-label:**
```html
<a href="/cart" aria-label="View cart">
  <isinclude template="common/icons/cart" />
</a>
```

**Good — title attribute:**
```html
<a href="/cart" title="View cart"></a>
```

**Note:** Links with `aria-hidden="true"` are skipped. These are typically decorative icon links that are paired with a visible, accessible sibling element.

> This rule cannot be auto-fixed because the tool cannot know what the correct link text should be. You must write it yourself.

---

## 13. What to do with non-fixable issues

For `input-label` and `empty-links`, the tool tells you exactly where the problem is. Here is the workflow:

1. Run the scan and note the file path and line number reported
2. Open the file in your editor and go to that line
3. Add the appropriate label or link text (see the examples in the rules above)
4. Save the file and run the scan again to confirm the issue is gone

```bash
# Scan, fix what can be fixed automatically
isml-a11y check --path ./cartridges --fix

# Then scan again to see what still needs manual attention
isml-a11y check --path ./cartridges
```

Work through the remaining issues one by one. When the final scan exits with code `0`, the project has no critical accessibility violations.
