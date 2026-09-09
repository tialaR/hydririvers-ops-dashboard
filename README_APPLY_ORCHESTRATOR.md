# Apply Hydri Orchestrator files

From the repository root:

```bash
cd ~/Desktop/hydririvers-ops-dashboard
unzip -o ~/Downloads/hydri-orchestrator-agent-rules.zip
```

Validate no code was changed:

```bash
git status --short
```

These files are documentation/rules only. They should not affect runtime.

Recommended commit:

```bash
git add AGENTS.md docs/AGENTS-ORCHESTRATOR.md .cursor/rules/hydri-orchestrator.mdc .github/copilot-instructions.md README_APPLY_ORCHESTRATOR.md
git commit -m "docs: add Hydri orchestrator agent rules"
```
