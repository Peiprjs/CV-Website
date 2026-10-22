#!/usr/bin/env python3
"""
update_data.py

Automatically synchronizes website data, metadata, and embedded preloads
based on data.json.

Features:
 1. Validates data.json structure, schema, IDs, and skill ratings (1-5).
 2. Generates/updates data.js (window.CV_DEFAULT_DATA) for instant 0ms paint and offline support.
 3. Synchronizes HTML <head> metadata (<title>, <meta description>, <meta author>, Open Graph)
    across index.html, desktop.html, mobile.html, and 404.html.
 4. Watch mode (--watch / -w) to automatically re-sync whenever data.json is saved.

Usage:
  python3 scripts/update_data.py            # Run once
  python3 scripts/update_data.py --watch    # Watch for changes
  python3 scripts/update_data.py --validate # Validate without writing
"""

import sys
import os
import json
import re
import time
from datetime import datetime

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_JSON_PATH = os.path.join(ROOT_DIR, 'data.json')
DATA_JS_PATH = os.path.join(ROOT_DIR, 'data.js')

HTML_FILES = [
    {'path': os.path.join(ROOT_DIR, 'index.html'), 'type': 'unified'},
    {'path': os.path.join(ROOT_DIR, 'desktop.html'), 'type': 'desktop'},
    {'path': os.path.join(ROOT_DIR, 'mobile.html'), 'type': 'mobile'},
    {'path': os.path.join(ROOT_DIR, '404.html'), 'type': '404'}
]

GREEN = '\033[32m'
CYAN = '\033[36m'
YELLOW = '\033[33m'
RED = '\033[31m'
BOLD = '\033[1m'
DIM = '\033[2m'
RESET = '\033[0m'

def log(msg): print(msg)
def success(msg): print(f"{GREEN}✔{RESET} {msg}")
def warn(msg): print(f"{YELLOW}⚠{RESET} {msg}")
def error(msg): print(f"{RED}✖{RESET} {msg}", file=sys.stderr)
def info(msg): print(f"{CYAN}ℹ{RESET} {msg}")

def validate_data(data):
    issues = []
    warnings = []

    if not isinstance(data, dict):
        issues.append("Root of data.json must be a JSON object.")
        return False, issues, warnings

    profile = data.get('profile')
    if not isinstance(profile, dict):
        issues.append('Missing required "profile" object.')
    else:
        if not profile.get('name'):
            issues.append('Missing "profile.name".')
        if not profile.get('title'):
            issues.append('Missing "profile.title".')
        if not profile.get('bio'):
            warnings.append('Missing "profile.bio" (recommended for meta descriptions).')

    theme = data.get('theme', {})
    if theme and theme.get('palette'):
        known = ['indigo', 'emerald', 'blue', 'violet', 'rose', 'amber', 'cyan']
        pal = theme['palette']
        if pal not in known and not re.match(r'^#[0-9a-fA-F]{6}$', pal):
            warnings.append(f'Theme palette "{pal}" is not a default preset ({", ".join(known)}) or a #RRGGBB hex.')

    skills = data.get('skills', {})
    if skills:
        def check_skills(arr, cat):
            if not isinstance(arr, list):
                issues.append(f'"skills.{cat}" must be a list.')
                return
            for idx, sk in enumerate(arr):
                if not sk.get('name'):
                    issues.append(f'skills.{cat}[{idx}] missing "name".')
                level = sk.get('level')
                if not isinstance(level, int) or level < 1 or level > 5:
                    issues.append(f'skills.{cat}[{idx}] has invalid level: {level}. Must be integer 1 to 5.')

        if 'hard' in skills: check_skills(skills['hard'], 'hard')
        if 'soft' in skills: check_skills(skills['soft'], 'soft')

    languages = data.get('languages')
    if languages is not None:
        if not isinstance(languages, list):
            issues.append('"languages" must be a list.')
        else:
            for idx, lang in enumerate(languages):
                if not lang.get('name'):
                    issues.append(f'languages[{idx}] missing "name".')
                if not lang.get('level'):
                    issues.append(f'languages[{idx}] ("{lang.get("name") or idx}") missing "level".')

    items = data.get('items')
    if not isinstance(items, list):
        issues.append('Missing or invalid "items" array.')
    else:
        valid_cats = ['work', 'volunteering', 'learning', 'certifications', 'hobbies', 'projects']
        seen_ids = set()
        for idx, item in enumerate(items):
            item_id = item.get('id')
            if not item_id:
                issues.append(f'Item at index {idx} missing unique "id".')
            elif item_id in seen_ids:
                issues.append(f'Duplicate item id: "{item_id}".')
            else:
                seen_ids.add(item_id)

            if not item.get('title'):
                issues.append(f'Item "{item_id or idx}" missing "title".')
            category = item.get('category')
            if not category:
                issues.append(f'Item "{item_id or idx}" missing "category".')
            elif category not in valid_cats:
                warnings.append(f'Item "{item_id}" uses custom category "{category}". Standard: {", ".join(valid_cats)}.')

    return len(issues) == 0, issues, warnings

def update_data_js(data):
    header = (
        "/**\n"
        " * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.\n"
        " * Generated from data.json via scripts/update_data.py\n"
        f" * Last generated: {datetime.now().isoformat()}\n"
        " * \n"
        " * Exposes window.CV_DEFAULT_DATA for instant 0ms first-paint\n"
        " * and offline / file:// protocol compatibility.\n"
        " */\n"
    )
    content = header + f"window.CV_DEFAULT_DATA = {json.dumps(data, indent=2)};\n"
    with open(DATA_JS_PATH, 'w', encoding='utf-8') as f:
        f.write(content)

def update_html_metadata(data):
    profile = data.get('profile', {})
    name = profile.get('name', 'Interactive CV')
    title = profile.get('title', 'Portfolio')
    bio = profile.get('bio', '').replace('"', '&quot;')
    bio = re.sub(r'\s+', ' ', bio).strip()

    updated_count = 0

    for file_obj in HTML_FILES:
        path = file_obj['path']
        if not os.path.exists(path):
            continue

        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        orig = content
        ftype = file_obj['type']

        if ftype == 'unified':
            page_title = f"{name} – {title}"
            page_desc = bio[:157] + '...' if len(bio) > 160 else bio
            og_title = page_title
            og_desc = f"Interactive CV and portfolio for {name} – {title}."
        elif ftype == 'desktop':
            page_title = f"{name} – Interactive CV & Portfolio (Desktop 2-Column Edition)"
            page_desc = f"Full-width, two-column desktop interactive CV and portfolio for {name} – {title}."
            og_title = f"{name} – Interactive CV & Portfolio (Desktop Edition)"
            og_desc = f"Full-width two-column interactive portfolio and CV for {name}."
        elif ftype == 'mobile':
            page_title = f"{name} – Interactive CV & Portfolio (Smartphone Edition)"
            page_desc = f"Smartphone-optimized interactive CV and portfolio for {name} – {title}."
            og_title = f"{name} – Interactive CV & Portfolio (Smartphone Edition)"
            og_desc = f"Touch-optimized interactive CV and portfolio for {name}."
        elif ftype == '404':
            page_title = f"Page Not Found – {name} Portfolio"
            page_desc = ""
            og_title = ""
            og_desc = ""

        if page_title:
            content = re.sub(r'<title>[\s\S]*?<\/title>', f'<title>{page_title}</title>', content, count=1, flags=re.IGNORECASE)
        if page_desc:
            content = re.sub(r'<meta\s+name=["\']description["\']\s+content=["\'][\s\S]*?["\']\s*\/?>', f'<meta name="description" content="{page_desc}">', content, count=1, flags=re.IGNORECASE)
        if name:
            content = re.sub(r'<meta\s+name=["\']author["\']\s+content=["\'][\s\S]*?["\']\s*\/?>', f'<meta name="author" content="{name}">', content, count=1, flags=re.IGNORECASE)
        if og_title:
            content = re.sub(r'<meta\s+property=["\']og:title["\']\s+content=["\'][\s\S]*?["\']\s*\/?>', f'<meta property="og:title" content="{og_title}">', content, count=1, flags=re.IGNORECASE)
        if og_desc:
            content = re.sub(r'<meta\s+property=["\']og:description["\']\s+content=["\'][\s\S]*?["\']\s*\/?>', f'<meta property="og:description" content="{og_desc}">', content, count=1, flags=re.IGNORECASE)

        if content != orig:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            updated_count += 1

    return updated_count

def run_update(validate_only=False, is_watch=False):
    t_str = time.strftime('%I:%M:%S %p')
    log(f"\n{BOLD}{CYAN}--- Synchronizing data.json [{t_str}] ---{RESET}")

    if not os.path.exists(DATA_JSON_PATH):
        error(f"Could not find {DATA_JSON_PATH}")
        if not is_watch: sys.exit(1)
        return False

    try:
        with open(DATA_JSON_PATH, 'r', encoding='utf-8') as f:
            raw = f.read()
            data = json.loads(raw)
    except Exception as e:
        error(f"Failed to parse data.json: {e}")
        if not is_watch: sys.exit(1)
        return False

    valid, issues, warnings = validate_data(data)
    if not valid:
        error("Validation failed with the following errors:")
        for iss in issues:
            print(f"  {RED}•{RESET} {iss}")
        if not is_watch: sys.exit(1)
        return False

    for w in warnings:
        warn(w)

    if validate_only:
        items_cnt = len(data.get('items', []))
        success(f"Validation passed! ({items_cnt} items verified)")
        return True

    update_data_js(data)
    size_kb = len(raw.encode('utf-8')) / 1024
    success(f"Updated {BOLD}data.js{RESET} ({size_kb:.1f} KB)")

    updated_html = update_html_metadata(data)
    success(f"Synchronized metadata across {updated_html} HTML files")

    skills = data.get('skills', {})
    hard_cnt = len(skills.get('hard', []))
    soft_cnt = len(skills.get('soft', []))
    languages_cnt = len(data.get('languages', []))
    items_cnt = len(data.get('items', []))
    palette = data.get('theme', {}).get('palette', 'default')
    profile = data.get('profile', {})

    log(f"{DIM}  • Profile: {BOLD}{profile.get('name')}{RESET}{DIM} ({profile.get('title')})")
    log(f"{DIM}  • Theme Palette: {BOLD}{palette}{RESET}")
    log(f"{DIM}  • Skills: {BOLD}{hard_cnt}{RESET}{DIM} hard, {BOLD}{soft_cnt}{RESET}{DIM} soft")
    log(f"{DIM}  • Languages: {BOLD}{languages_cnt}{RESET}{DIM} language entries (CEFR / JLPT segmented bars)")
    log(f"{DIM}  • CV Items: {BOLD}{items_cnt}{RESET}{DIM} total entries")
    log(f"{GREEN}✔ All data successfully synchronized!{RESET}\n")
    return True

def main():
    args = sys.argv[1:]
    is_watch = '--watch' in args or '-w' in args
    is_val = '--validate' in args or '-v' in args

    if '--help' in args or '-h' in args:
        print(f"""
{BOLD}Usage:{RESET}
  python3 scripts/update_data.py [options]

{BOLD}Options:{RESET}
  -w, --watch     Watch data.json for changes and automatically re-synchronize
  -v, --validate  Validate data.json structure without writing files
  -h, --help      Show this help message
""")
        sys.exit(0)

    run_update(validate_only=is_val, is_watch=is_watch)

    if is_watch:
        info(f"Watching for file changes in {BOLD}data.json{RESET}... (Press Ctrl+C to exit)")
        last_mtime = os.path.getmtime(DATA_JSON_PATH)
        try:
            while True:
                time.sleep(0.5)
                try:
                    mtime = os.path.getmtime(DATA_JSON_PATH)
                    if mtime != last_mtime:
                        last_mtime = mtime
                        run_update(is_watch=True)
                except FileNotFoundError:
                    pass
        except KeyboardInterrupt:
            print("\nWatch stopped.")

if __name__ == '__main__':
    main()
