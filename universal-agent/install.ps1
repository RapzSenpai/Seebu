$src = Join-Path $PSScriptRoot ".agent/skills"
$targets = @(".agent/skills", ".agents/skills", ".claude/skills", ".codex/skills", ".cursor/skills", ".opencode/skills", ".kilo/skills", ".kilocode/skills", "skills")
foreach ($t in $targets) {
  New-Item -ItemType Directory -Path $t -Force | Out-Null
  Copy-Item -Recurse -Force -Path "$src/*" -Destination $t
}
Write-Output "shims done"
