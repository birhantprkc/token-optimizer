<p align="center">
  <img src="skills/token-optimizer/assets/logo.svg" alt="Token Optimizer" width="780">
</p>

<p align="center">
  <a href="https://github.com/alexgreensh/token-optimizer/releases"><img src="https://img.shields.io/badge/version-2.4.0-green" alt="Version 2.4.0"></a>
  <a href="https://github.com/alexgreensh/token-optimizer"><img src="https://img.shields.io/badge/Claude_Code-Plugin-blueviolet" alt="Claude Code Plugin"></a>
  <a href="https://github.com/alexgreensh/token-optimizer/blob/main/LICENSE"><img src="https://img.shields.io/github/license/alexgreensh/token-optimizer" alt="License"></a>
  <a href="https://github.com/alexgreensh/token-optimizer/stargazers"><img src="https://img.shields.io/github/stars/alexgreensh/token-optimizer" alt="GitHub Stars"></a>
  <a href="https://github.com/alexgreensh/token-optimizer/commits/main"><img src="https://img.shields.io/github/last-commit/alexgreensh/token-optimizer" alt="Last Commit"></a>
  <img src="https://img.shields.io/badge/python-3.8+-blue" alt="Python 3.8+">
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-lightgrey" alt="Platform">
</p>

<h2 align="center">Your AI is getting dumber and you can't see it.</h2>

<p align="center">
Opus 4.6 drops from 93% to 76% accuracy across a 1M context window. Compaction loses 60-70% of your conversation. Token Optimizer tracks the degradation, protects your decisions, and tells you what to fix.
</p>

```
$ python3 measure.py quick

TOKEN OPTIMIZER: QUICK SCAN
========================================
  Context window:      1,000,000 tokens (1M, auto-detected Opus 4.6)
  Startup overhead:    62,400 tokens (6.2%)
  Usable before degradation: ~437K (50% fill = peak quality zone)
  Messages before auto-compact: ~153 at typical message size

  DEGRADATION RISK
    Current startup fill:  6% (62,400) -- PEAK ZONE
    Quality estimate:      ~96/100 (MRCR-based at this fill level)
    Next danger zone:      500,000 (50%, "lost in the middle" begins)
    Auto-compact fires at: ~800,000 (60-70% of context LOST per compaction)

  TOP OFFENDERS
    1. 58 skills loaded (42 unused in 30 days): 18,200 tokens
    2. 12 MCP servers (3 with eager-loaded tools): 11,400 tokens
    3. CLAUDE.md (482 lines): 7,800 tokens

  #1 QUICK WIN
    Archive 42 unused skills -> save ~12,600 tokens/session
    Extends peak quality zone by ~12,600 tokens

  COACHING INSIGHT
    At 1M, Sonnet 4.6 outperforms Opus on multi-hop reasoning
    (GraphWalks: 73.8 vs 38.7). Consider Sonnet for long code sessions.
```

## Install (3 lines)

```bash
# Plugin (recommended, auto-updates)
/plugin marketplace add alexgreensh/token-optimizer
/plugin install token-optimizer@alexgreensh-token-optimizer
```

Or script installer:

```bash
curl -fsSL https://raw.githubusercontent.com/alexgreensh/token-optimizer/main/install.sh | bash
```

Then in Claude Code: `/token-optimizer`

## Why install this first?

Every Claude Code session starts with invisible overhead: system prompt, tool definitions, skills, MCP servers, CLAUDE.md, MEMORY.md. A typical power user burns 50-70K tokens before typing a word.

At 200K context, that's 25-35% gone. At 1M, it's "only" 5-7%, but the degradation curve is the real problem:

- **MRCR drops from 93% to 76%** as context fills from 256K to 1M
- **Higher effort = faster context burn.** More thinking tokens per response means you hit compaction sooner.
- **Compaction is catastrophic.** 60-70% of your conversation gone per compaction. After 2-3 compactions: 88-95% cumulative loss. Claude starts hallucinating tool calls.
- **Sonnet 4.6 beats Opus on long-context reasoning** (GraphWalks: 73.8 vs 38.7 at 1M)

Token Optimizer tracks all of this. Quality score, degradation bands, compaction loss, drift detection. Zero context tokens consumed (runs as external Python).

---

### NEW in v2.4: Degradation Intelligence

| Command | What It Does |
|---------|-------------|
| `quick` | Overhead + degradation risk + top offenders + model coaching. The 10-second health check. |
| `doctor` | Verify all components installed. Score out of 10 with fix commands. |
| `drift` | Compare against your last snapshot. See how your setup has grown. |
| `quality` | 7-signal analysis with MRCR-based degradation bands. |
| `report` | Full per-component token breakdown. |
| `/token-optimizer` | Interactive audit with 6 parallel agents. Guided fixes. |

```bash
python3 $MEASURE_PY quick                # 10-second overview
python3 $MEASURE_PY doctor               # health check
python3 $MEASURE_PY drift                # drift since last snapshot
python3 $MEASURE_PY quality current      # session quality
python3 $MEASURE_PY report               # full report
```

### Quality Scoring (7 signals)

| Signal | Weight | What It Catches |
|--------|--------|----------------|
| **Context fill degradation** | 20% | MRCR-based quality estimate from fill level |
| **Stale reads** | 20% | Files edited since reading (wasted context) |
| **Bloated results** | 20% | Tool outputs never referenced again |
| **Compaction depth** | 15% | Each compaction: 60-70% context lost |
| **Duplicates** | 10% | Repeated system-reminder injections |
| **Decision density** | 8% | Ratio of substantive to filler messages |
| **Agent efficiency** | 7% | Subagent result tokens vs dispatch overhead |

Degradation bands in the status bar:
- Green (<50% fill): peak quality zone
- Yellow (50-70%): degradation starting
- Orange (70-80%): quality dropping
- Red (80%+): severe, consider /clear

### Smart Compaction

Auto-compaction is lossy. Smart Compaction checkpoints decisions, errors, and agent state before it fires, then restores what the summary dropped.

```bash
python3 $MEASURE_PY setup-smart-compact    # checkpoint + restore hooks
python3 $MEASURE_PY setup-quality-bar      # live quality score in status bar
```

---

## How It Compares

| Capability | Token Optimizer | `/context` (built-in) | context-mode |
|---|---|---|---|
| Startup overhead audit | Deep (per-component) | Summary (v2.1.74+) | No |
| Quality degradation tracking | MRCR-based bands | Basic capacity % | No |
| Guided remediation | Yes, with token estimates | Basic suggestions | No |
| Runtime output containment | No | No | Yes (98% reduction) |
| Smart compaction survival | Checkpoint + restore | No | Session guide |
| Model recommendation | Yes (Sonnet vs Opus by context) | No | No |
| Usage trends + dashboard | SQLite + interactive HTML | No | Session stats |
| Compaction loss tracking | Yes (cumulative % lost) | No | Partial |
| Multi-platform | Claude Code (planned expansion) | Claude Code | 6 platforms |
| Context tokens consumed | 0 (Python script) | ~200 tokens | MCP overhead |

`/context` shows capacity. Token Optimizer fixes the causes.
context-mode prevents runtime floods. Token Optimizer prevents structural waste.

---

## The Problem

Every message you send to Claude Code re-sends everything: system prompt, tool definitions, MCP servers, skills, commands, CLAUDE.md, MEMORY.md, and system reminders. The API is stateless. These are the ghost tokens: invisible overhead that eats your context window before you type a word.

Prompt caching makes this [cheap](https://code.claude.com/docs/en/costs) (90% cost reduction). But cheap doesn't mean small. Those tokens still fill your context window, count toward rate limits, and degrade output quality.

The more you've customized Claude Code, the worse it gets.

![Where your context window goes](skills/token-optimizer/assets/user-profiles.svg)

### Where it all goes

**Fixed overhead** (everyone pays): System prompt (~3K tokens) plus built-in tool definitions (12-17K tokens). About 8-10% of your 200K window.

**Autocompact buffer**: ~30-35K tokens (~16%) reserved for compaction headroom.

**MCP tools**: The biggest variable. Anthropic's team [measured 134K tokens consumed by tool definitions](https://www.anthropic.com/engineering/advanced-tool-use) before optimization. [Tool Search](https://www.anthropic.com/engineering/advanced-tool-use) reduced this by 85%, but servers still add up.

**Your config stack** (what this tool optimizes): CLAUDE.md that's grown organically. MEMORY.md that duplicates half of it. 50+ skills you installed and forgot. Commands you never use. [`@imports`](https://code.claude.com/docs/en/memory). [`.claude/rules/`](https://code.claude.com/docs/en/memory). No `permissions.deny` rules.

## What This Does

One command. Six parallel agents audit your entire setup. Prioritized fixes with exact token savings.

```
> /token-optimizer

[Token Optimizer] Backing up config...
Dispatching 6 audit agents...

YOUR SETUP
Per-message overhead:  ~43,000 tokens
Context used:          38% before your first message

QUICK WINS
  Slim CLAUDE.md + MEMORY.md:      -5,200 tokens/msg
  Archive unused skills + commands: -4,800 tokens/msg
  Prune MCP + add file exclusion:    -5,000 tokens/msg

Total: ~15,000 tokens/msg recovered

Ready to implement? Everything backed up first.
```

Everything gets backed up before any change. You see diffs. You approve each fix. Nothing irreversible.

### What it audits

| Area | What It Catches |
|------|----------------|
| **CLAUDE.md** | Content that should be skills or reference files. Duplication with MEMORY.md. [`@imports`](https://code.claude.com/docs/en/memory). Poor cache structure. |
| **MEMORY.md** | Overlap with CLAUDE.md. Verbose entries. Content past the [200-line auto-load cap](https://code.claude.com/docs/en/memory). |
| **Skills** | Unused skills loading frontmatter (~100 tokens each). Duplicates. Wrong directory. |
| **MCP Servers** | Broken/unused servers. Duplicate tools. Missing [Tool Search](https://www.anthropic.com/engineering/advanced-tool-use). |
| **Commands** | Rarely-used commands (~50 tokens each). |
| **Rules & Advanced** | [`.claude/rules/`](https://code.claude.com/docs/en/memory) overhead. Missing `permissions.deny`. No hooks. |

### The fix: progressive disclosure

| Where | Token Cost | What Goes Here |
|-------|-----------|----------------|
| **CLAUDE.md** | Every message (~800 token target) | Identity, critical rules, key paths |
| **Skills & references** | ~100 tokens in menu, full when invoked | Workflows, configs, standards |
| **Project files** | Zero until read | Guides, templates, documentation |

## Interactive Dashboard

After the audit, you get an interactive HTML dashboard.

![Token Optimizer Dashboard](skills/token-optimizer/assets/dashboard-overview.png)

Every component is clickable. Expand any item to see why it matters, what the trade-offs are, and what changes. Toggle the fixes you want, and copy a ready-to-paste optimization prompt.

### Persistent Dashboard

The dashboard auto-regenerates after every session (via the SessionEnd hook).

```bash
python3 $MEASURE_PY setup-daemon     # Bookmarkable URL at http://localhost:24842/
python3 $MEASURE_PY dashboard --serve # One-time serve over HTTP
```

## Enable Session Tracking

```bash
python3 $MEASURE_PY setup-hook --dry-run   # preview
python3 $MEASURE_PY setup-hook             # install
```

Adds a SessionEnd hook that collects usage stats after each session (~2 seconds, all data local).

## Usage Analytics

### Usage Trends

```bash
python3 $MEASURE_PY trends
python3 $MEASURE_PY trends --days 7
python3 $MEASURE_PY trends --json
```

Shows skills usage (installed vs actually invoked), model mix, daily breakdown.

### Session Health

```bash
python3 $MEASURE_PY health
```

Detects stale sessions (24h+), zombie sessions (48h+), outdated versions, automated processes.

## Coach Mode

```
> /token-coach
```

One question: "What's your goal today?" Then architecture guidance, pattern detection with named anti-patterns, multi-agent design patterns, and a prioritized action plan.

8 named anti-patterns, multi-agent design patterns, hard numbers. Coach tab in the dashboard.

```bash
python3 $MEASURE_PY coach --json          # Full JSON output
python3 $MEASURE_PY coach --focus skills   # Focus on skill patterns
python3 $MEASURE_PY coach --focus agentic  # Focus on multi-agent patterns
```

## v2.0+: Active Session Intelligence

### Smart Compaction

```bash
python3 $MEASURE_PY setup-smart-compact --dry-run   # preview
python3 $MEASURE_PY setup-smart-compact              # install
python3 $MEASURE_PY setup-smart-compact --status     # check
python3 $MEASURE_PY setup-smart-compact --uninstall  # remove
```

Captures: decisions and reasoning, modified files, error-fix sequences, open questions, agent dispatch state. All stored as plain markdown in `~/.claude/token-optimizer/checkpoints/`.

### Context Quality Analyzer

```bash
python3 $MEASURE_PY quality current
```

```
Context Quality Report
========================================
Content quality:     74/100 (Good)
Degradation band:    PEAK ZONE (34% fill, ~91/100 MRCR)
Messages analyzed:   156
Decisions captured:  8

Issues found:
   23 stale file reads    (14,000 tokens est.)
    3 bloated results     ( 8,000 tokens est.)
    2 compaction(s) (~88% cumulative context loss)
```

### Live Quality Bar

```
Opus 4.6 | my-project ████████░░ 43% | Q:74 Compacts:2(~88% lost)
```

Degradation-aware colors: green (peak), yellow (degrading), orange (dropping), red (severe).

```bash
python3 $MEASURE_PY setup-quality-bar --dry-run   # preview
python3 $MEASURE_PY setup-quality-bar              # install
```

### Session Continuity

Sessions auto-checkpoint on end, /clear, and crashes. New sessions pick up via keyword-matched context injection.

| Variable | Default | Controls |
|----------|---------|---------|
| `TOKEN_OPTIMIZER_CHECKPOINT_TTL` | 300 (5 min) | Max age for post-compact restore |
| `TOKEN_OPTIMIZER_CHECKPOINT_FILES` | 10 | Max checkpoint files kept |
| `TOKEN_OPTIMIZER_CHECKPOINT_RETENTION_DAYS` | 7 | Cleanup age |
| `TOKEN_OPTIMIZER_RELEVANCE_THRESHOLD` | 0.3 | Keyword overlap for restore |

## Measurement Tool

Standalone script. No dependencies. Python 3.8+.

```bash
# Auto-detect path:
MEASURE_PY=""
for f in ~/.claude/skills/token-optimizer/scripts/measure.py \
         ~/.claude/plugins/cache/*/token-optimizer/*/skills/token-optimizer/scripts/measure.py; do
  [ -f "$f" ] && MEASURE_PY="$f" && break
done
[ -z "$MEASURE_PY" ] && { echo "measure.py not found. Is Token Optimizer installed?"; exit 1; }
```

```bash
python3 $MEASURE_PY quick                # Quick scan with degradation bands
python3 $MEASURE_PY doctor               # Health check (10 checks)
python3 $MEASURE_PY drift                # Drift report vs last snapshot
python3 $MEASURE_PY report               # Full token report
python3 $MEASURE_PY quality current      # Session quality analysis
python3 $MEASURE_PY dashboard            # Interactive dashboard
python3 $MEASURE_PY trends               # Usage trends
python3 $MEASURE_PY coach                # Coaching data
python3 $MEASURE_PY collect              # Collect sessions to SQLite

# Global flag: override context window detection
python3 $MEASURE_PY quick --context-size 1000000
```

## What's Inside

```
skills/token-optimizer/
  SKILL.md                             Orchestrator (phases 0-5 + v2.0 actions)
  assets/
    dashboard.html                     Interactive dashboard
    logo.svg                           Animated ASCII logo
    hero-terminal.svg                  Terminal demo
  references/
    agent-prompts.md                   8 agent prompt templates
    implementation-playbook.md         Fix implementation details
    optimization-checklist.md          32 optimization techniques
    token-flow-architecture.md         How Claude Code loads tokens
  examples/
    claude-md-optimized.md             Optimized CLAUDE.md template
    permissions-deny-template.json     permissions.deny starter
    hooks-starter.json                 Hook configuration
  scripts/
    measure.py                         Core engine (audit, quality, smart compact, trends, health, quick, doctor, drift)
    statusline.js                      Status line (degradation-aware colors)
skills/token-coach/
  SKILL.md                             Coaching orchestrator
install.sh                             One-command installer
```

## License

AGPL-3.0. See [LICENSE](LICENSE).

Created by [Alex Greenshpun](https://linkedin.com/in/alexgreensh).
