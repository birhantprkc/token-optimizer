#!/usr/bin/env python3
"""Cross-platform hook dispatcher.

Invoked via `python3 "${CLAUDE_PLUGIN_ROOT}/hooks/run.py" <script> args`
from hooks.json. The explicit `python3` prefix is required because
PowerShell on Windows does not run bare-path quoted commands as
executables -- it treats them as string expressions (Microsoft Learn:
about_Parsing) -- and the .py file association is not honored by
PowerShell command discovery. The `python3` prefix also matches the
Claude Code plugin ecosystem convention.

The wrapper resolves the target script under CLAUDE_PLUGIN_ROOT, checks
it exists, and runs it with the same interpreter that ran this file
(sys.executable). On timeout we kill the child (Popen.kill) to avoid
leaking a process holding the trends.db lock. Always exits 0 so hook
failures never block the user's tool call.

Usage in hooks.json:
  "command": "python3 \"${CLAUDE_PLUGIN_ROOT}/hooks/run.py\" <script-relative-path> [args...]"

Windows notes:
- Microsoft Store Python registers `python3` via App Execution Aliases
  (Python docs, "Using Python on Windows" section 4.8.1). Recommended
  install for Windows users.
- python.org installer ships `python.exe` and `py.exe` but not
  `python3.exe`. Users must add a `python3` alias or use Microsoft
  Store Python for hooks to run.
- If `python3` is not on PATH, hooks silently fail (non-blocking) --
  behavior identical to the pre-v5.2 plugin on Windows, so no
  regression for affected users.
"""
from __future__ import annotations

import os
import subprocess
import sys


def main() -> int:
    if len(sys.argv) < 2:
        return 0

    script_rel = sys.argv[1]
    script_args = sys.argv[2:]

    plugin_root = os.environ.get("CLAUDE_PLUGIN_ROOT", "").strip()
    if plugin_root:
        script_path = os.path.join(plugin_root, script_rel)
    else:
        # Fallback: relative to this wrapper's parent directory.
        script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", script_rel)

    script_path = os.path.normpath(script_path)
    if not os.path.isfile(script_path):
        return 0

    # Use the interpreter that ran this wrapper so we inherit the correct
    # Python across macOS/Linux/Windows without relying on PATH.
    cmd = [sys.executable, script_path, *script_args]
    proc = None
    try:
        proc = subprocess.Popen(cmd)
        try:
            proc.wait(timeout=120)
        except subprocess.TimeoutExpired:
            # Important: Popen.wait doesn't auto-kill on timeout. Leaving
            # the child alive would leak a process holding the trends.db
            # SQLite lock, starving the next hook invocation.
            try:
                proc.kill()
                proc.wait(timeout=5)
            except (subprocess.SubprocessError, OSError):
                pass
    except (subprocess.SubprocessError, OSError):
        if proc is not None:
            try:
                proc.kill()
            except (subprocess.SubprocessError, OSError):
                pass
    return 0


if __name__ == "__main__":
    sys.exit(main())
