'use strict';

const { glob } = require('glob');
const fs = require('fs-extra');
const path = require('path');

/**
 * Recursively find all .isml files under the given directory.
 * @param {string} dir - Absolute path to scan
 * @returns {Promise<string[]>} Array of absolute file paths
 */
async function scanFiles(dir) {
  const exists = await fs.pathExists(dir);
  if (!exists) {
    throw new Error(`Path does not exist: ${dir}`);
  }

  const stat = await fs.stat(dir);
  if (!stat.isDirectory()) {
    throw new Error(`Path is not a directory: ${dir}`);
  }

  const pattern = '**/*.isml';
  const files = await glob(pattern, {
    cwd: dir,
    absolute: true,
    nodir: true,
  });

  return files.sort();
}

module.exports = { scanFiles };
