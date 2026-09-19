import { describe, expect, it } from 'vitest';
import { evaluateShell, evaluateWrite } from '../../../scripts/governance/agentic-policy.mjs';

const policy = {
  version: 1,
  protectedPaths: [
    '.cursor/hooks.json',
    '.github/workflows/',
    'config/agentic/',
    'docs/governance/figma-freeze/',
    'tests/visual-baselines/'
  ],
  baselinePaths: [
    'docs/governance/figma-freeze/',
    'tests/visual-baselines/'
  ],
  dangerousGitPattern: '(^|\\s|&&|;)(git\\s+(commit|push|merge|rebase|reset|clean|cherry-pick|am|tag|checkout|switch)\\b)',
  dependencyMutationPattern: '(^|\\s|&&|;)((npm|pnpm|yarn)\\s+(install|add|update|upgrade|remove|uninstall)\\b)',
  deploymentPattern: '(^|\\s|&&|;)((vercel\\b.*(--prod|deploy)|npm\\s+publish\\b|gh\\s+release\\b))'
};

const contract = {
  mode: 'implement',
  allowedPaths: ['src/features/cargo/owned/'],
  forbiddenPaths: ['src/features/cargo/public/'],
  allowProtectedWrites: false,
  allowBaselineMutation: false,
  allowDependencyChanges: false,
  allowGitMutation: false,
  allowDeploy: false
};

describe('agentic electric fences', () => {
  it('denies writes when no task contract exists', () => {
    expect(evaluateWrite('src/features/cargo/owned/x.tsx', policy, null).permission).toBe('deny');
  });

  it('allows a write inside the human-issued allowlist', () => {
    expect(evaluateWrite('src/features/cargo/owned/x.tsx', policy, contract).permission).toBe('allow');
  });

  it('denies a write outside the allowlist', () => {
    expect(evaluateWrite('src/shared/x.ts', policy, contract).permission).toBe('deny');
  });

  it('denies canonical Figma baseline mutation by default', () => {
    expect(evaluateWrite('docs/governance/figma-freeze/page-61/reference.png', policy, contract).permission).toBe('deny');
  });

  it('denies explicitly forbidden paths', () => {
    expect(evaluateWrite('src/features/cargo/public/x.tsx', policy, contract).permission).toBe('deny');
  });

  it('asks before git mutation', () => {
    expect(evaluateShell('git commit -am "oops"', policy, contract).permission).toBe('ask');
  });

  it('asks before dependency mutation', () => {
    expect(evaluateShell('npm install left-pad', policy, contract).permission).toBe('ask');
  });

  it('asks before production deploy', () => {
    expect(evaluateShell('vercel --prod', policy, contract).permission).toBe('ask');
  });

  it('allows read-only git inspection', () => {
    expect(evaluateShell('git diff --stat', policy, contract).permission).toBe('allow');
  });
});
