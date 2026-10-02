#!/bin/bash
set -e
src="$(dirname "$0")/.agent/skills"
for t in .agents/skills .claude/skills .codex/skills .cursor/skills .opencode/skills .kilo/skills .kilocode/skills skills; do
  mkdir -p "$t"
  cp -r "$src"/. "$t"/
done
echo "shims done"
