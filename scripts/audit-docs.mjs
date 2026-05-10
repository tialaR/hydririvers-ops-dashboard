import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const requiredFiles = [
  'docs/README.md',
  'docs/ONBOARDING.md',
  'docs/adr/README.md',
  'docs/adr/0000-template.md',
  'docs/product/hydririvers-storytelling-overview.md',
  'docs/architecture/application-architecture-map.md',
  'docs/audits/implementation-status-audit.md',
  'docs/audits/final-implementation-status.md',
  'docs/audits/automation-workflows-audit.md',
  'docs/automation/documentation-workflow.md',
  'docs/automation/design-system-workflow.md',
  'docs/automation/ai-assisted-development-workflow.md',
  'docs/automation/release-workflow.md',
  'docs/automation/observability-workflow.md',
  'docs/automation/quality-checklist.md'
];

let hasFailure = false;

for (const file of requiredFiles) {
  const absolutePath = resolve(process.cwd(), file);
  if (existsSync(absolutePath)) {
    console.log(`OK  ${file}`);
  } else {
    console.log(`FAIL ${file}`);
    hasFailure = true;
  }
}

if (hasFailure) {
  console.error('Documentation audit incomplete ❌');
  process.exit(1);
}

console.log('Documentation audit complete ✅');
