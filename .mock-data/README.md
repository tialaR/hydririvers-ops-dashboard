# `.mock-data/` (local only)

JSON files in this directory are **generated at runtime** from seeds in `src/features/**/data/*.mock.ts` and `src/shared/server/mock-scenarios.ts`. They are **gitignored** so manual tests, registrations, and QA edits are not committed.

- **Do not** paste real emails, phones, password hashes, or base64 avatars here.
- **Reset** with `npm run mock-data:reset` (or delete `*.json` and restart the dev server).
- **Workflow:** see `docs/automation/mock-data-privacy-workflow.md`.
