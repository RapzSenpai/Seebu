# universal-agent — plug and play

Copy of your current pack (caveman, ponytail, low-effort, grill-me, superpowers).
Your own `skills/` untouched. This folder is the portable copy.

## Use

1. Copy everything inside `universal-agent/` into new project root:
   - `.agent/skills/*`
   - `AGENTS.md`, `CLAUDE.md`
2. Run shim install so other harnesses find it:
   - Windows: `.\install.ps1`
   - Mac/Linux: `bash install.sh`
3. Open project in other AI. It reads `AGENTS.md` / `CLAUDE.md` + `SKILL.md` files.

## What shims do

Canonical source = `.agent/skills/`. Install script copies same files to:
- `.claude/skills/` (Claude Code)
- `.codex/skills/` (Codex)
- `.cursor/skills/` (Cursor)
- `.opencode/skills/` (OpenCode)
- `skills/` (generic fallback)

No duplication in git. Shims are local copies only.

## Contents (16)

caveman, caveman-commit, caveman-review, caveman-stats, ponytail,
low-effort, grill-me, grilling, using-superpowers, brainstorming,
systematic-debugging, test-driven-development, writing-plans,
executing-plans, verification-before-completion, ask-questions-if-underspecified
