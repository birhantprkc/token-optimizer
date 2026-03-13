#!/usr/bin/env node
// Token Optimizer - Claude Code Status Line
// Shows: model | project | context bar used% | Q:score | Compacts:N(loss)
//
// Install: python3 measure.py setup-quality-bar
// The quality score is updated by a UserPromptSubmit hook every ~2 minutes.
// Reads from quality-cache.json (global fallback, always updated).

const fs = require('fs');
const path = require('path');
const os = require('os');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const model = data.model?.display_name || 'Claude';
    const dir = data.workspace?.current_dir || process.cwd();
    const remaining = data.context_window?.remaining_percentage;

    // Context window bar with degradation-aware colors
    // Colors based on MRCR degradation bands:
    //   <50% fill = green (peak zone), 50-70% = yellow (degradation starting),
    //   70-80% = orange (quality dropping), 80%+ = red (severe)
    let ctx = '';
    if (remaining != null) {
      const rem = Math.round(remaining);
      const used = Math.max(0, Math.min(100, 100 - rem));

      const filled = Math.floor(used / 10);
      const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(10 - filled);

      if (used < 50) {
        ctx = ` \x1b[32m${bar} ${used}%\x1b[0m`;           // Green: peak zone
      } else if (used < 70) {
        ctx = ` \x1b[33m${bar} ${used}%\x1b[0m`;           // Yellow: degradation starting
      } else if (used < 80) {
        ctx = ` \x1b[38;5;208m${bar} ${used}%\x1b[0m`;     // Orange: quality dropping
      } else {
        ctx = ` \x1b[5;31m${bar} ${used}%\x1b[0m`;         // Red blinking: severe
      }
    }

    // Read quality cache (global fallback, always kept in sync by measure.py)
    let qScore = '';
    let sessionInfo = '';
    const cacheDir = path.join(os.homedir(), '.claude', 'token-optimizer');
    const qFile = path.join(cacheDir, 'quality-cache.json');

    if (fs.existsSync(qFile)) {
      try {
        const q = JSON.parse(fs.readFileSync(qFile, 'utf8'));
        const s = q.score;
        if (s != null) {
          const score = Math.round(s);
          if (score >= 85) {
            qScore = ` \x1b[2m|\x1b[0m \x1b[32mQ:${score}\x1b[0m`;
          } else if (score >= 70) {
            qScore = ` \x1b[2m|\x1b[0m \x1b[2mQ:${score}\x1b[0m`;
          } else if (score >= 50) {
            qScore = ` \x1b[2m|\x1b[0m \x1b[33mQ:${score}\x1b[0m`;
          } else {
            qScore = ` \x1b[2m|\x1b[0m \x1b[31mQ:${score}\x1b[0m`;
          }
        }

        // Compaction count with cumulative loss info
        const c = q.compactions;
        if (c != null && c > 0) {
          const lossMap = { 1: '~65%', 2: '~88%' };
          const loss = lossMap[c] || '~95%';
          if (c <= 2) {
            sessionInfo = ` \x1b[33mCompacts:${c}(${loss} lost)\x1b[0m`;
          } else {
            sessionInfo = ` \x1b[31mCompacts:${c}(${loss} lost)\x1b[0m`;
          }
        }
      } catch (e) {}
    }

    const dirname = path.basename(dir);
    process.stdout.write(`\x1b[2m${model}\x1b[0m \x1b[2m|\x1b[0m \x1b[2m${dirname}\x1b[0m${ctx}${qScore}${sessionInfo}`);
  } catch (e) {
    // Silent fail - never break the status line
  }
});
