#!/usr/bin/env python3
"""
verify_pdf.py — Automated Validation & Normalization for Generated Resume PDF

Validates:
1. PDF file existence and non-trivial file size (> 50KB).
2. Valid PDF file signature (%PDF-).
3. Exact page count (2 pages for standard executive resume format).
4. Key content tokens across Page 1 and Page 2.
5. Deterministic metadata normalization (--normalize).
"""

import os
import sys

# ANSI Colors
GREEN = "\033[0;32m"
RED = "\033[0;31m"
BLUE = "\033[0;34m"
YELLOW = "\033[0;33m"
BOLD = "\033[1m"
RESET = "\033[0m"


def normalize_pdf(pdf_path: str) -> bool:
    """Sets deterministic metadata on the PDF so byte hashes remain stable across builds."""
    try:
        import pypdf

        reader = pypdf.PdfReader(pdf_path)
        writer = pypdf.PdfWriter()
        writer.append(reader)
        writer.add_metadata({
            "/Author": "Bhargav Kukadiya",
            "/Title": "Bhargav Kukadiya — Senior iOS Developer & Apple Platforms Architect",
            "/Creator": "Headless Chrome / Resume Pipeline",
            "/Producer": "Bhargav Kukadiya Portfolio Engine",
            "/CreationDate": "D:20260101000000Z",
            "/ModDate": "D:20260101000000Z",
        })
        temp_out = f"{pdf_path}.tmp_norm"
        with open(temp_out, "wb") as f:
            writer.write(f)
        os.replace(temp_out, pdf_path)
        return True
    except Exception as e:
        print(f"{YELLOW}⚠️  Could not normalize PDF metadata: {e}{RESET}")
        return False


def verify_pdf(pdf_path: str, normalize: bool = False) -> bool:
    print(f"{BLUE}======================================================{RESET}")
    print(f"{BOLD}🔍 Verifying PDF Resume:{RESET} {pdf_path}")
    print(f"{BLUE}======================================================{RESET}")

    if not os.path.isfile(pdf_path):
        print(f"{RED}❌ Error: PDF file does not exist at '{pdf_path}'{RESET}")
        return False

    file_size = os.path.getsize(pdf_path)
    file_size_kb = file_size / 1024
    print(f"  • Initial File Size: {BOLD}{file_size_kb:.1f} KB{RESET} ({file_size} bytes)")

    if file_size < 50 * 1024:
        print(f"{RED}❌ Error: PDF size is unexpectedly small (< 50KB)!{RESET}")
        return False

    # Check PDF magic bytes
    with open(pdf_path, "rb") as f:
        header = f.read(5)
        if header != b"%PDF-":
            print(f"{RED}❌ Error: File does not appear to be a valid PDF (invalid magic bytes: {header}){RESET}")
            return False

    # Require pypdf for complete validation
    try:
        import pypdf
    except ImportError:
        print(f"{RED}❌ Error: 'pypdf' package is required for PDF verification but is not installed!{RESET}")
        print(f"   Install it with: pip install pypdf (or run 'make setup')")
        return False

    if normalize:
        if not normalize_pdf(pdf_path):
            print(f"{RED}❌ Error: Metadata normalization failed!{RESET}")
            return False
        new_size = os.path.getsize(pdf_path)
        print(f"  • Metadata normalized for byte-for-byte determinism ({new_size / 1024:.1f} KB) ✅")

    reader = pypdf.PdfReader(pdf_path)
    page_count = len(reader.pages)
    print(f"  • Total Pages: {BOLD}{page_count}{RESET}")

    if page_count != 2:
        print(f"{RED}❌ Error: Expected exactly 2 pages, but found {page_count} pages!{RESET}")
        return False

    print(f"  • Page count check passed: exactly 2 pages ✅")

    # Extract and assert content
    p1_text = reader.pages[0].extract_text()
    p2_text = reader.pages[1].extract_text()

    required_p1_tokens = [
        "BHARGAV KUKADIYA",
        "Senior iOS Developer & Apple Platforms Architect",
        "Civica - Collect",
    ]

    required_p2_tokens = [
        "PasskeyManager",
        "photo-curator",
        "aws-beginner-guide",
        "macos-dir-tools",
    ]

    missing_tokens = []

    for token in required_p1_tokens:
        if token not in p1_text:
            missing_tokens.append(f"Page 1: '{token}'")

    for token in required_p2_tokens:
        if token not in p2_text:
            missing_tokens.append(f"Page 2: '{token}'")

    if missing_tokens:
        print(f"{RED}❌ Verification failed! Missing required text tokens:{RESET}")
        for missing in missing_tokens:
            print(f"    - {missing}")
        return False

    print(f"  • Header & Candidate Identity: Verified ✅")
    print(f"  • Open-Source Ecosystem Entries: Verified ✅")
    print(f"  • Production Applications: Verified ✅")
    print("")
    print(f"{GREEN}🎉 All PDF validation checks passed successfully!{RESET}")
    return True


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    do_norm = "--normalize" in sys.argv

    target = args[0] if args else os.path.join(
        os.path.dirname(__file__), "..", "public", "assets", "documents", "resume.pdf"
    )
    target = os.path.abspath(target)
    success = verify_pdf(target, normalize=do_norm)
    sys.exit(0 if success else 1)
