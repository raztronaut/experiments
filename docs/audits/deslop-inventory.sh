#!/usr/bin/env bash
# Re-run deslop automated inventory (Phase 2). Run from repo root.
# Usage: ./docs/audits/deslop-inventory.sh

set -e
SRC="${1:-src}"

echo "=== Type casts (as any / as unknown as / : any) ==="
grep -rn 'as any\|as unknown as\|: any' "$SRC" 2>/dev/null || true

echo ""
echo "=== try/catch locations ==="
grep -rn 'try\s*{' "$SRC" 2>/dev/null || true

echo ""
echo "=== Files >= 200 lines ==="
find "$SRC" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec wc -l {} \; 2>/dev/null | awk '$1 >= 200 { print $1, $2 }' | sort -rn

echo ""
echo "=== Legacy experiments ==="
grep -rl '"legacy":\s*true' "$SRC/app/experiments" 2>/dev/null || true
