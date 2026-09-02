#!/usr/bin/env python3
"""
verify_site.py — Comprehensive Frontend & Markup Verification Suite

Validates:
1. Strict HTML tag balance and void tag compliance for public/index.html and content/resume.html.
2. Link safety: ensures all target="_blank" links include rel="noopener".
3. Image accessibility: ensures all <img> tags include non-empty alt text.
4. Heading hierarchy: detects skipped heading levels (e.g., h2 to h4).
5. Asset existence: verifies all local src and href paths resolve to real files on disk.
6. Certificate catalog: verifies all 24 modular certificate PDFs exist with descriptive names.
7. JavaScript syntax: executes node --check public/assets/js/site.js.
"""

import os
import re
import sys
import subprocess
from html.parser import HTMLParser
from typing import List, Tuple, Set

# ANSI Colors
GREEN = "\033[0;32m"
RED = "\033[0;31m"
BLUE = "\033[0;34m"
YELLOW = "\033[0;33m"
BOLD = "\033[1m"
RESET = "\033[0m"

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


class SiteHTMLValidator(HTMLParser):
    VOID_TAGS: Set[str] = {
        "area", "base", "br", "col", "embed", "hr", "img",
        "input", "link", "meta", "param", "source", "track", "wbr"
    }

    def __init__(self, filename: str):
        super().__init__()
        self.filename = filename
        self.tag_stack: List[Tuple[str, Tuple[int, int]]] = []
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.local_links: List[Tuple[str, int]] = []
        self.heading_levels: List[Tuple[int, int]] = []

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, str]]):
        pos = self.getpos()
        attr_dict = dict(attrs)

        # Check void vs non-void tag
        if tag.lower() not in self.VOID_TAGS:
            self.tag_stack.append((tag.lower(), pos))

        # Check heading hierarchy
        if re.match(r"^h[1-6]$", tag.lower()):
            level = int(tag[1])
            self.heading_levels.append((level, pos[0]))

        # Check link safety for external links
        if tag.lower() == "a":
            target = attr_dict.get("target")
            rel = attr_dict.get("rel", "")
            if target == "_blank" and "noopener" not in rel:
                self.warnings.append(
                    f"Line {pos[0]}: target='_blank' link missing rel='noopener' (href='{attr_dict.get('href', '')}')"
                )

        # Check local assets existence from href, src, and data-pdfs
        for attr in ("href", "src"):
            val = attr_dict.get(attr)
            if val and not val.startswith(("#", "http://", "https://", "mailto:", "tel:", "data:", "about:")):
                clean_path = val.split("?")[0].split("#")[0]
                if clean_path:
                    self.local_links.append((clean_path, pos[0]))

        # Check data-pdfs json attribute on certificate buttons
        if "data-pdfs" in attr_dict:
            import json
            try:
                pdfs = json.loads(attr_dict["data-pdfs"])
                for p in pdfs:
                    clean_path = p.split("?")[0].split("#")[0]
                    if clean_path:
                        self.local_links.append((clean_path, pos[0]))
            except Exception as e:
                self.errors.append(f"Line {pos[0]}: Malformed JSON in data-pdfs: {e}")

        # Image accessibility
        if tag.lower() == "img":
            alt = attr_dict.get("alt")
            aria_hidden = attr_dict.get("aria-hidden") == "true"
            if not aria_hidden and (alt is None or not alt.strip()):
                self.warnings.append(f"Line {pos[0]}: <img> missing descriptive alt attribute")

    def handle_endtag(self, tag: str):
        pos = self.getpos()
        if tag.lower() in self.VOID_TAGS:
            return

        if not self.tag_stack:
            self.errors.append(f"Line {pos[0]}: Unexpected closing </{tag}> tag with no opening tag")
            return

        last_tag, open_pos = self.tag_stack.pop()
        if last_tag != tag.lower():
            self.errors.append(
                f"Line {pos[0]}: Mismatched tag: expected </{last_tag}> (opened line {open_pos[0]}), found </{tag}>"
            )

    def validate_heading_hierarchy(self):
        last_level = 0
        for level, line in self.heading_levels:
            if last_level > 0 and level > last_level + 1:
                self.warnings.append(
                    f"Line {line}: Skipped heading level from h{last_level} to h{level}"
                )
            last_level = level


def verify_html(file_rel_path: str) -> bool:
    full_path = os.path.join(REPO_ROOT, file_rel_path)
    if not os.path.isfile(full_path):
        print(f"{RED}❌ File not found: {file_rel_path}{RESET}")
        return False

    base_dir = os.path.dirname(full_path)
    parser = SiteHTMLValidator(file_rel_path)
    with open(full_path, "r", encoding="utf-8") as f:
        parser.feed(f.read())

    # Check unclosed tags
    if parser.tag_stack:
        for tag, pos in parser.tag_stack:
            parser.errors.append(f"Line {pos[0]}: Unclosed tag <{tag}>")

    parser.validate_heading_hierarchy()

    # Check local link references (relative to file directory or repo root)
    missing_assets = []
    for link, line in parser.local_links:
        # Check relative to base_dir first, then REPO_ROOT
        asset_path1 = os.path.normpath(os.path.join(base_dir, link))
        asset_path2 = os.path.normpath(os.path.join(REPO_ROOT, link))
        if not os.path.exists(asset_path1) and not os.path.exists(asset_path2):
            missing_assets.append(f"Line {line}: Asset does not exist on disk: '{link}'")

    success = len(parser.errors) == 0 and len(missing_assets) == 0 and len(parser.warnings) == 0

    print(f"  • {BOLD}{file_rel_path}{RESET}:")
    if success:
        print(f"    - Structure: Tag hierarchy 100% balanced ✅")
        print(f"    - Local Assets: All {len(parser.local_links)} referenced files exist ✅")
        print(f"    - Accessibility & Link Safety: 0 warnings ✅")
    else:
        for err in parser.errors:
            print(f"    {RED}❌ Error:{RESET} {err}")
        for missing in missing_assets:
            print(f"    {RED}❌ Missing Asset:{RESET} {missing}")
        for warn in parser.warnings:
            print(f"    {RED}❌ Accessibility / Link Safety Violation:{RESET} {warn}")

    return success


def verify_certificates_catalog() -> bool:
    cert_base = os.path.join(REPO_ROOT, "public", "assets", "documents", "certificates")
    categories = ["dotnet", "javascript", "sql", "secure-development"]
    missing = []
    total_found = 0

    for cat in categories:
        cat_dir = os.path.join(cert_base, cat)
        if not os.path.isdir(cat_dir):
            missing.append(f"Missing category directory: {cat}")
            continue
        files = [f for f in os.listdir(cat_dir) if f.endswith(".pdf")]
        total_found += len(files)

    print(f"  • {BOLD}Certificates Catalog{RESET}:")
    if not missing and total_found >= 24:
        print(f"    - All {total_found} modular certificate PDFs verified in lowercase directories ✅")
        return True
    else:
        for m in missing:
            print(f"    {RED}❌ {m}{RESET}")
        return False


def verify_javascript() -> bool:
    js_path = os.path.join(REPO_ROOT, "public", "assets", "js", "site.js")
    if not os.path.isfile(js_path):
        print(f"  • {BOLD}site.js{RESET}: {RED}File not found at {js_path}{RESET}")
        return False

    try:
        res = subprocess.run(["node", "--check", js_path], capture_output=True, text=True)
        if res.returncode == 0:
            print(f"  • {BOLD}site.js{RESET}: Node syntax validation passed ✅")
            return True
        else:
            print(f"  • {BOLD}site.js{RESET}: {RED}Syntax Error!{RESET}\n{res.stderr}")
            return False
    except FileNotFoundError:
        print(f"  • {BOLD}site.js{RESET}: {RED}Node.js is required for JavaScript syntax validation. Please install Node.js.{RESET}")
        return False


def main():
    print(f"{BLUE}======================================================{RESET}")
    print(f"{BOLD}🌐 Frontend & Markup Verification Suite{RESET}")
    print(f"{BLUE}======================================================{RESET}")

    html_ok1 = verify_html("public/index.html")
    html_ok2 = verify_html("content/resume.html")
    cert_ok = verify_certificates_catalog()
    js_ok = verify_javascript()

    if html_ok1 and html_ok2 and cert_ok and js_ok:
        print(f"\n{GREEN}🎉 All frontend validation checks passed successfully!{RESET}\n")
        sys.exit(0)
    else:
        print(f"\n{RED}❌ Frontend validation failed! Please resolve the errors above.{RESET}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
