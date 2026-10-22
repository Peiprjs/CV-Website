#!/usr/bin/env node

/**
 * update-data.js
 * 
 * Automatically synchronizes website data, metadata, and embedded preloads
 * based on data.json.
 * 
 * Features:
 *  1. Validates data.json structure, schema, IDs, and skill ratings (1-5).
 *  2. Generates/updates data.js (window.CV_DEFAULT_DATA) for instant 0ms paint and offline support.
 *  3. Synchronizes HTML <head> metadata (<title>, <meta description>, <meta author>, Open Graph)
 *     across index.html, desktop.html, mobile.html, and 404.html.
 *  4. Watch mode (--watch / -w) to automatically re-sync whenever data.json is saved.
 * 
 * Usage:
 *   node scripts/update-data.js            # Run once
 *   node scripts/update-data.js --watch    # Watch for changes
 *   node scripts/update-data.js --validate # Validate without writing
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_JSON_PATH = path.join(ROOT_DIR, 'data.json');
const DATA_JS_PATH = path.join(ROOT_DIR, 'data.js');
const HTML_FILES = [
  { path: path.join(ROOT_DIR, 'index.html'), type: 'unified' },
  { path: path.join(ROOT_DIR, 'desktop.html'), type: 'desktop' },
  { path: path.join(ROOT_DIR, 'mobile.html'), type: 'mobile' },
  { path: path.join(ROOT_DIR, '404.html'), type: '404' }
];

// ANSI Colors for clean terminal output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function log(msg) { console.log(msg); }
function success(msg) { console.log(`${colors.green}✔${colors.reset} ${msg}`); }
function warn(msg) { console.log(`${colors.yellow}⚠${colors.reset} ${msg}`); }
function error(msg) { console.error(`${colors.red}✖${colors.reset} ${msg}`); }
function info(msg) { console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`); }

/**
 * 1. Validate data.json structure and contents
 */
function validateData(data) {
  const issues = [];
  const warnings = [];

  if (!data || typeof data !== 'object') {
    issues.push('Root of data.json must be an object.');
    return { valid: false, issues, warnings };
  }

  // Profile validation
  if (!data.profile || typeof data.profile !== 'object') {
    issues.push('Missing required "profile" object.');
  } else {
    if (!data.profile.name) issues.push('Missing "profile.name".');
    if (!data.profile.title) issues.push('Missing "profile.title".');
    if (!data.profile.bio) warnings.push('Missing "profile.bio" (recommended for meta descriptions).');
  }

  // Theme validation
  if (data.theme && data.theme.palette) {
    const knownPalettes = ['indigo', 'emerald', 'blue', 'violet', 'rose', 'amber', 'cyan'];
    const p = data.theme.palette;
    if (!knownPalettes.includes(p) && !/^#[0-9a-fA-F]{6}$/.test(p)) {
      warnings.push(`Theme palette "${p}" is not a default preset (${knownPalettes.join(', ')}) or a valid #RRGGBB hex code.`);
    }
  }

  // Skills validation
  if (data.skills) {
    const checkSkills = (arr, category) => {
      if (!Array.isArray(arr)) {
        issues.push(`"skills.${category}" must be an array.`);
        return;
      }
      arr.forEach((sk, idx) => {
        if (!sk.name) issues.push(`skills.${category}[${idx}] missing "name".`);
        if (typeof sk.level !== 'number' || sk.level < 1 || sk.level > 5) {
          issues.push(`skills.${category}[${idx}] ("${sk.name || idx}") has invalid level: ${sk.level}. Must be 1 to 5.`);
        }
      });
    };
    if (data.skills.hard) checkSkills(data.skills.hard, 'hard');
    if (data.skills.soft) checkSkills(data.skills.soft, 'soft');
  }

  // Languages validation
  if (data.languages) {
    if (!Array.isArray(data.languages)) {
      issues.push('"languages" must be an array.');
    } else {
      data.languages.forEach((lang, idx) => {
        if (!lang.name) issues.push(`languages[${idx}] missing "name".`);
        if (!lang.level) issues.push(`languages[${idx}] ("${lang.name || idx}") missing "level".`);
      });
    }
  }

  // Items validation
  if (!Array.isArray(data.items)) {
    issues.push('Missing or invalid "items" array.');
  } else {
    const validCategories = ['work', 'volunteering', 'learning', 'certifications', 'hobbies', 'projects'];
    const seenIds = new Set();

    data.items.forEach((item, idx) => {
      if (!item.id) {
        issues.push(`Item at index ${idx} is missing a unique "id".`);
      } else if (seenIds.has(item.id)) {
        issues.push(`Duplicate item id: "${item.id}".`);
      } else {
        seenIds.add(item.id);
      }

      if (!item.title) issues.push(`Item "${item.id || idx}" is missing "title".`);
      if (!item.category) {
        issues.push(`Item "${item.id || idx}" is missing "category".`);
      } else if (!validCategories.includes(item.category)) {
        warnings.push(`Item "${item.id}" uses custom category "${item.category}". Standard categories are: ${validCategories.join(', ')}.`);
      }
    });
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings
  };
}

/**
 * 2. Update data.js
 */
function updateDataJs(data) {
  const fileHeader = `/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Generated from data.json via scripts/update-data.js
 * Last generated: ${new Date().toISOString()}
 * 
 * Exposes window.CV_DEFAULT_DATA for instant 0ms first-paint
 * and offline / file:// protocol compatibility.
 */
`;
  const content = fileHeader + `window.CV_DEFAULT_DATA = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(DATA_JS_PATH, content, 'utf8');
}

/**
 * 3. Update HTML metadata (<title>, <meta description>, Open Graph)
 */
function updateHtmlMetadata(data) {
  const name = data.profile?.name || 'Interactive CV';
  const title = data.profile?.title || 'Portfolio';
  const bio = data.profile?.bio ? data.profile.bio.replace(/"/g, '&quot;').replace(/\s+/g, ' ').trim() : '';

  let updatedCount = 0;

  for (const fileObj of HTML_FILES) {
    if (!fs.existsSync(fileObj.path)) continue;

    let content = fs.readFileSync(fileObj.path, 'utf8');
    const originalContent = content;

    let pageTitle = '';
    let pageDesc = '';
    let ogTitle = '';
    let ogDesc = '';

    if (fileObj.type === 'unified') {
      pageTitle = `${name} – ${title}`;
      pageDesc = bio.length > 160 ? bio.substring(0, 157) + '...' : bio;
      ogTitle = pageTitle;
      ogDesc = `Interactive CV and portfolio for ${name} – ${title}.`;
    } else if (fileObj.type === 'desktop') {
      pageTitle = `${name} – Interactive CV & Portfolio (Desktop 2-Column Edition)`;
      pageDesc = `Full-width, two-column desktop interactive CV and portfolio for ${name} – ${title}.`;
      ogTitle = `${name} – Interactive CV & Portfolio (Desktop Edition)`;
      ogDesc = `Full-width two-column interactive portfolio and CV for ${name}.`;
    } else if (fileObj.type === 'mobile') {
      pageTitle = `${name} – Interactive CV & Portfolio (Smartphone Edition)`;
      pageDesc = `Smartphone-optimized interactive CV and portfolio for ${name} – ${title}.`;
      ogTitle = `${name} – Interactive CV & Portfolio (Smartphone Edition)`;
      ogDesc = `Touch-optimized interactive CV and portfolio for ${name}.`;
    } else if (fileObj.type === '404') {
      pageTitle = `Page Not Found – ${name} Portfolio`;
    }

    if (pageTitle) {
      content = content.replace(/<title>[\s\S]*?<\/title>/i, `<title>${pageTitle}</title>`);
    }

    if (pageDesc) {
      content = content.replace(
        /<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
        `<meta name="description" content="${pageDesc}">`
      );
    }

    if (name) {
      content = content.replace(
        /<meta\s+name=["']author["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
        `<meta name="author" content="${name}">`
      );
    }

    if (ogTitle) {
      content = content.replace(
        /<meta\s+property=["']og:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
        `<meta property="og:title" content="${ogTitle}">`
      );
    }

    if (ogDesc) {
      content = content.replace(
        /<meta\s+property=["']og:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
        `<meta property="og:description" content="${ogDesc}">`
      );
    }

    if (content !== originalContent) {
      fs.writeFileSync(fileObj.path, content, 'utf8');
      updatedCount++;
    }
  }

  return updatedCount;
}

/**
 * Main execution handler
 */
function runUpdate(options = {}) {
  const timestamp = new Date().toLocaleTimeString();
  log(`\n${colors.bold}${colors.cyan}--- Synchronizing data.json [${timestamp}] ---${colors.reset}`);

  if (!fs.existsSync(DATA_JSON_PATH)) {
    error(`Could not find ${DATA_JSON_PATH}`);
    process.exit(1);
  }

  let rawData;
  let parsedData;

  try {
    rawData = fs.readFileSync(DATA_JSON_PATH, 'utf8');
    parsedData = JSON.parse(rawData);
  } catch (err) {
    error(`Failed to parse data.json: ${err.message}`);
    if (!options.watch) process.exit(1);
    return false;
  }

  // Validate
  const validation = validateData(parsedData);
  if (!validation.valid) {
    error('Validation failed with the following errors:');
    validation.issues.forEach(iss => console.log(`  ${colors.red}•${colors.reset} ${iss}`));
    if (!options.watch) process.exit(1);
    return false;
  }

  if (validation.warnings.length > 0) {
    validation.warnings.forEach(w => warn(w));
  }

  if (options.validateOnly) {
    success(`Validation passed! (${parsedData.items?.length || 0} items verified)`);
    return true;
  }

  // Update data.js
  updateDataJs(parsedData);
  success(`Updated ${colors.bold}data.js${colors.reset} (${(Buffer.byteLength(rawData) / 1024).toFixed(1)} KB)`);

  // Update HTML metadata
  const htmlUpdated = updateHtmlMetadata(parsedData);
  success(`Synchronized metadata across ${htmlUpdated} HTML files`);

  // Print Summary Stats
  const hardSkillsCount = parsedData.skills?.hard?.length || 0;
  const softSkillsCount = parsedData.skills?.soft?.length || 0;
  const languagesCount = parsedData.languages?.length || 0;
  const itemsCount = parsedData.items?.length || 0;
  const palette = parsedData.theme?.palette || 'default';

  log(`${colors.dim}  • Profile: ${colors.bold}${parsedData.profile?.name}${colors.reset}${colors.dim} (${parsedData.profile?.title})`);
  log(`${colors.dim}  • Theme Palette: ${colors.bold}${palette}${colors.reset}`);
  log(`${colors.dim}  • Skills: ${colors.bold}${hardSkillsCount}${colors.reset}${colors.dim} hard, ${colors.bold}${softSkillsCount}${colors.reset}${colors.dim} soft`);
  log(`${colors.dim}  • Languages: ${colors.bold}${languagesCount}${colors.reset}${colors.dim} language entries (CEFR / JLPT segmented bars)`);
  log(`${colors.dim}  • CV Items: ${colors.bold}${itemsCount}${colors.reset}${colors.dim} total entries`);
  log(`${colors.green}✔ All data successfully synchronized!${colors.reset}\n`);

  return true;
}

// Parse Command Line Flags
const args = process.argv.slice(2);
const isWatch = args.includes('--watch') || args.includes('-w');
const isValidateOnly = args.includes('--validate') || args.includes('-v');

if (args.includes('--help') || args.includes('-h')) {
  log(`
${colors.bold}Usage:${colors.reset}
  node scripts/update-data.js [options]

${colors.bold}Options:${colors.reset}
  -w, --watch     Watch data.json for changes and automatically re-synchronize
  -v, --validate  Validate data.json structure without writing files
  -h, --help      Show this help message
`);
  process.exit(0);
}

// Initial Run
runUpdate({ validateOnly: isValidateOnly, watch: isWatch });

// Watch mode setup
if (isWatch) {
  info(`Watching for file changes in ${colors.bold}data.json${colors.reset}... (Press Ctrl+C to exit)`);
  let debounceTimeout = null;

  fs.watch(DATA_JSON_PATH, (eventType) => {
    if (eventType === 'change' || eventType === 'rename') {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        try {
          runUpdate({ watch: true });
        } catch (e) {
          error(`Unexpected error during update: ${e.message}`);
        }
      }, 100);
    }
  });
}
