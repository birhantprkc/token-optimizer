---
name: token-dashboard
description: Open the Token Optimizer dashboard. Collects latest session data, regenerates the dashboard, and opens it in your browser.
---

# Token Optimizer Dashboard

Opens an up-to-date dashboard showing your context usage trends, quality scores, session history, and skill management.

## Instructions

1. **Resolve measure.py path**:
```bash
MEASURE_PY=""
for f in "$HOME/.claude/skills/token-optimizer/scripts/measure.py" \
         "$HOME/.claude/plugins/cache"/*/token-optimizer/*/skills/token-optimizer/scripts/measure.py; do
  [ -f "$f" ] && MEASURE_PY="$f" && break
done
[ -z "$MEASURE_PY" ] && { echo "[Error] measure.py not found. Is Token Optimizer installed?"; exit 1; }
```

2. **Collect and open**:
```bash
python3 "$MEASURE_PY" collect --quiet && python3 "$MEASURE_PY" dashboard
```

This collects the latest session data into the trends database, regenerates the dashboard HTML, and opens it in your default browser.

3. **Tell the user** the dashboard is open. URL-first ordering (v5.3.3+):
   - Probe daemon: `python3 "$MEASURE_PY" daemon-status 2>/dev/null`
   - If DAEMON_RUNNING: lead with `URL: http://localhost:24842/token-optimizer` (bookmarkable, auto-updates), then mention the file fallback `File: ~/.claude/_backups/token-optimizer/dashboard.html`.
   - If DAEMON_NOT_RUNNING: lead with the file `File: ~/.claude/_backups/token-optimizer/dashboard.html`, then suggest: "Want a bookmarkable URL? Run `python3 $MEASURE_PY setup-daemon` (macOS and Windows)."
