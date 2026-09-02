# ==============================================================================
# Makefile — Bhargav Kukadiya Portfolio & Resume Automation
# ==============================================================================

.PHONY: help setup pdf verify verify-site all serve clean

help:
	@echo "Available commands:"
	@echo "  make setup        Install Python verification dependencies (pypdf)"
	@echo "  make pdf          Generate deterministic resume PDF from content/resume.html"
	@echo "  make verify       Verify generated resume PDF integrity and page count"
	@echo "  make verify-site  Verify HTML structure, link safety, and JavaScript syntax"
	@echo "  make all          Generate deterministic PDF and verify entire site"
	@echo "  make serve        Start local preview server on http://localhost:8000"
	@echo "  make clean        Remove temporary and test files"

setup:
	@python3 -m pip install --quiet -r requirements.txt
	@echo "Dependencies installed successfully."

pdf:
	@./tools/generate_pdf.sh --force

verify:
	@python3 tools/verify_pdf.py

verify-site:
	@python3 tests/verify_site.py

all:
	@./tools/generate_pdf.sh --force --verify
	@python3 tests/verify_site.py

serve:
	@echo "Serving public/ on http://localhost:8000 (Ctrl+C to stop)..."
	@python3 -m http.server --directory public 8000

clean:
	@rm -f test_*.pdf *.tmp *.tmp_norm
	@echo "Cleaned temporary files."
