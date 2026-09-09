# Apply Hydri Orchestrator V2

## Apply

```bash
cd ~/Desktop/hydririvers-ops-dashboard
unzip -o ~/Downloads/hydri-orchestrator-agent-v2.zip
```

## Clean dangerous extracted snapshots

If a root `files/` folder exists, remove it. TypeScript may typecheck it and fail.

```bash
rm -rf files
```

## Validate runtime was not changed

```bash
npm run lint
npm run typecheck
npm run check:i18n
```

## Generate Business agent context

```bash
./scripts/export-hydri-agent-context.sh
```

Upload the generated `hydri-agent-context-*.zip` to the Business agent Knowledge.
