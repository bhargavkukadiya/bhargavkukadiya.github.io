#!/usr/bin/env bash
# ==============================================================================
# generate_pdf.sh — Deterministic Resume PDF Generator
#
# Generates high-fidelity PDF from resume.html using headless Chrome / Chromium.
# Works across macOS, Linux (CI/CD), and Windows without npm dependencies.
# ==============================================================================

set -euo pipefail

# Script directory and repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Colors for terminal output
BOLD="\033[1m"
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

# Default configuration
DEFAULT_INPUT="${REPO_ROOT}/content/resume.html"
DEFAULT_OUTPUT="${REPO_ROOT}/public/assets/documents/resume.pdf"
INPUT_FILE="${DEFAULT_INPUT}"
OUTPUT_FILE="${DEFAULT_OUTPUT}"
RUN_VERIFY=false
FORCE_REBUILD=false

# ------------------------------------------------------------------------------
# Usage / Help
# ------------------------------------------------------------------------------
usage() {
    cat << EOF
${BOLD}Usage:${RESET} $(basename "$0") [options] [input_html] [output_pdf]

${BOLD}Options:${RESET}
  -i, --input <path>     Path to source HTML file (default: content/resume.html)
  -o, --output <path>    Path to destination PDF file (default: public/assets/documents/resume.pdf)
  -v, --verify           Run verification check on generated PDF
  -f, --force            Force rebuild even if output PDF is already newer than input
  -h, --help             Show this help message and exit

${BOLD}Environment Variables:${RESET}
  CHROME_BIN             Explicit path to Chrome / Chromium executable

${BOLD}Examples:${RESET}
  $(basename "$0")
  $(basename "$0") --verify
  $(basename "$0") --force
  $(basename "$0") -i resume.html -o output.pdf
EOF
    exit 0
}

# ------------------------------------------------------------------------------
# Parse CLI Arguments
# ------------------------------------------------------------------------------
POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
    case "$1" in
        -i|--input)
            INPUT_FILE="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        -v|--verify)
            RUN_VERIFY=true
            shift
            ;;
        -f|--force)
            FORCE_REBUILD=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        -*)
            echo -e "${RED}Unknown option: $1${RESET}" >&2
            usage
            ;;
        *)
            POSITIONAL_ARGS+=("$1")
            shift
            ;;
    esac
done

# Handle positional arguments if provided
if [[ ${#POSITIONAL_ARGS[@]} -ge 1 ]]; then
    INPUT_FILE="${POSITIONAL_ARGS[0]}"
fi
if [[ ${#POSITIONAL_ARGS[@]} -ge 2 ]]; then
    OUTPUT_FILE="${POSITIONAL_ARGS[1]}"
fi

# Convert relative paths to absolute paths
if [[ ! "${INPUT_FILE}" = /* ]]; then
    INPUT_FILE="$(pwd)/${INPUT_FILE}"
fi
if [[ ! "${OUTPUT_FILE}" = /* ]]; then
    OUTPUT_FILE="$(pwd)/${OUTPUT_FILE}"
fi

# Ensure input file exists
if [[ ! -f "${INPUT_FILE}" ]]; then
    echo -e "${RED}Error: Input HTML file not found at:${RESET} ${INPUT_FILE}" >&2
    exit 1
fi

# ------------------------------------------------------------------------------
# Check If Existing PDF Is Already Up-to-Date
# ------------------------------------------------------------------------------
if [[ "${FORCE_REBUILD}" != true && -f "${OUTPUT_FILE}" && -s "${OUTPUT_FILE}" && "${OUTPUT_FILE}" -nt "${INPUT_FILE}" ]]; then
    echo -e "${GREEN}✅ PDF is already up-to-date with $(basename "${INPUT_FILE}"). Skipping generation.${RESET}"
    echo -e "   Location: ${OUTPUT_FILE}"
    echo -e "   (Use --force to regenerate anyway)"
    echo ""

    if [[ "${RUN_VERIFY}" == true ]]; then
        VERIFY_SCRIPT="${SCRIPT_DIR}/verify_pdf.py"
        if [[ -f "${VERIFY_SCRIPT}" ]]; then
            python3 "${VERIFY_SCRIPT}" "${OUTPUT_FILE}"
        fi
    fi
    exit 0
fi

# ------------------------------------------------------------------------------
# Locate Chrome / Chromium Executable
# ------------------------------------------------------------------------------
find_chrome() {
    # 1. Check user-defined CHROME_BIN
    if [[ -n "${CHROME_BIN:-}" && -x "${CHROME_BIN}" ]]; then
        echo "${CHROME_BIN}"
        return 0
    fi

    # 2. Potential binaries based on OS
    local candidates=()
    if [[ "$OSTYPE" == "darwin"* ]]; then
        candidates=(
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
            "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"
            "/Applications/Chromium.app/Contents/MacOS/Chromium"
            "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
            "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
            "$(command -v google-chrome 2>/dev/null || true)"
            "$(command -v chromium 2>/dev/null || true)"
        )
    elif [[ "$OSTYPE" == "linux"* ]]; then
        candidates=(
            "$(command -v google-chrome-stable 2>/dev/null || true)"
            "$(command -v google-chrome 2>/dev/null || true)"
            "$(command -v chromium-browser 2>/dev/null || true)"
            "$(command -v chromium 2>/dev/null || true)"
            "/usr/bin/google-chrome"
            "/usr/bin/google-chrome-stable"
            "/usr/bin/chromium-browser"
            "/usr/bin/chromium"
        )
    else
        # Windows / Git Bash / Cygwin / WSL
        candidates=(
            "$(command -v chrome 2>/dev/null || true)"
            "$(command -v chrome.exe 2>/dev/null || true)"
            "/c/Program Files/Google/Chrome/Application/chrome.exe"
            "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"
        )
    fi

    for candidate in "${candidates[@]}"; do
        if [[ -n "${candidate}" && -x "${candidate}" ]]; then
            echo "${candidate}"
            return 0
        fi
    done

    return 1
}

CHROME_EXEC="$(find_chrome || true)"

if [[ -z "${CHROME_EXEC}" ]]; then
    echo -e "${RED}Error: Google Chrome or Chromium executable not found!${RESET}" >&2
    echo -e "Please install Chrome or set the CHROME_BIN environment variable." >&2
    echo -e "Example: export CHROME_BIN=\"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome\"" >&2
    exit 1
fi

# Ensure output directory exists
OUTPUT_DIR="$(dirname "${OUTPUT_FILE}")"
mkdir -p "${OUTPUT_DIR}"

echo -e "${BLUE}======================================================${RESET}"
echo -e "${BOLD}📄 Resume PDF Generator (Deterministic)${RESET}"
echo -e "${BLUE}======================================================${RESET}"
echo -e "  ${BOLD}Input:${RESET}   ${INPUT_FILE}"
echo -e "  ${BOLD}Output:${RESET}  ${OUTPUT_FILE}"
echo -e "  ${BOLD}Engine:${RESET}  ${CHROME_EXEC}"
echo ""

# ------------------------------------------------------------------------------
# Execute Headless Chrome Print to PDF
# ------------------------------------------------------------------------------
echo -e "${YELLOW}⏳ Generating PDF in headless mode...${RESET}"

TEMP_LOG="$(mktemp "${TMPDIR:-/tmp}/chrome_pdf_XXXXXX.log")"
trap 'rm -f "${TEMP_LOG}"' EXIT

set +e
"${CHROME_EXEC}" \
    --headless=new \
    --disable-gpu \
    --no-sandbox \
    --disable-setuid-sandbox \
    --disable-dev-shm-usage \
    --no-pdf-header-footer \
    --run-all-compositor-stages-before-draw \
    --virtual-time-budget=2000 \
    --print-to-pdf="${OUTPUT_FILE}" \
    "file://${INPUT_FILE}" > "${TEMP_LOG}" 2>&1
EXIT_CODE=$?
set -e

if [[ ${EXIT_CODE} -ne 0 || ! -f "${OUTPUT_FILE}" ]]; then
    echo -e "${RED}❌ PDF generation failed (Exit code: ${EXIT_CODE})!${RESET}" >&2
    cat "${TEMP_LOG}" >&2
    exit 1
fi

FILE_SIZE="$(wc -c < "${OUTPUT_FILE}" | tr -d ' ')"
FILE_SIZE_KB="$((FILE_SIZE / 1024))"

if [[ "${FILE_SIZE}" -le 1000 ]]; then
    echo -e "${RED}❌ Generated PDF is suspiciously small (${FILE_SIZE} bytes). Generation may have failed.${RESET}" >&2
    cat "${TEMP_LOG}" >&2
    exit 1
fi

echo -e "${GREEN}✅ PDF successfully generated!${RESET}"
echo -e "   File size: ${BOLD}${FILE_SIZE_KB} KB${RESET} (${FILE_SIZE} bytes)"
echo -e "   Location:  ${OUTPUT_FILE}"

# ------------------------------------------------------------------------------
# Run Verification and Metadata Normalization
# ------------------------------------------------------------------------------
VERIFY_SCRIPT="${SCRIPT_DIR}/verify_pdf.py"
if [[ -f "${VERIFY_SCRIPT}" ]]; then
    if [[ "${RUN_VERIFY}" == true ]]; then
        echo -e "${YELLOW}🔍 Running verification & normalization...${RESET}"
        python3 "${VERIFY_SCRIPT}" --normalize "${OUTPUT_FILE}"
    else
        python3 "${VERIFY_SCRIPT}" --normalize "${OUTPUT_FILE}" >/dev/null
    fi
fi

exit 0
