import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const ROOT = process.cwd();
export const POLICY_PATH = path.join(ROOT, 'config/agentic/policy.json');
export const CONTRACT_PATH = path.join(ROOT, '.agentic/current-task.json');

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function loadPolicy() {
  return readJson(POLICY_PATH);
}

export function loadContract() {
  return existsSync(CONTRACT_PATH) ? readJson(CONTRACT_PATH) : null;
}

export function normalizeRepoPath(filePath) {
  const absolute = path.isAbsolute(filePath) ? filePath : path.resolve(ROOT, filePath);
  const relative = path.relative(ROOT, absolute).replaceAll('\\\\', '/');
  if (relative === '' || relative.startsWith('../')) return relative;
  return relative;
}

function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

function globToRegExp(rule) {
  const source = escapeRegex(rule)
    .replaceAll('\\*\\*', '.*')
    .replaceAll('\\*', '[^/]*');
  return new RegExp(`^${source}$`);
}

export function pathMatchesRule(filePath, rule) {
  const normalized = normalizeRepoPath(filePath);
  if (!rule) return false;
  if (rule.endsWith('/')) return normalized.startsWith(rule);
  if (rule.includes('*')) return globToRegExp(rule).test(normalized);
  return normalized === rule;
}

export function pathMatchesAny(filePath, rules = []) {
  return rules.some((rule) => pathMatchesRule(filePath, rule));
}

export function evaluateWrite(filePath, policy = loadPolicy(), contract = loadContract()) {
  const relative = normalizeRepoPath(filePath);
  if (!relative || relative.startsWith('../')) {
    return { permission: 'deny', reason: 'Write outside repository is not authorized.' };
  }

  if (!contract) {
    return { permission: 'deny', reason: 'No .agentic/current-task.json. Open a task contract before implementation.' };
  }

  if (contract.mode !== 'implement') {
    return { permission: 'deny', reason: `Task contract mode is "${contract.mode}", not "implement".` };
  }

  if (pathMatchesAny(relative, policy.baselinePaths) && contract.allowBaselineMutation !== true) {
    return { permission: 'deny', reason: `Canonical baseline is immutable for this task: ${relative}` };
  }

  if (pathMatchesAny(relative, policy.protectedPaths) && contract.allowProtectedWrites !== true) {
    return { permission: 'deny', reason: `Protected governance path requires explicit contract authorization: ${relative}` };
  }

  if (pathMatchesAny(relative, contract.forbiddenPaths ?? [])) {
    return { permission: 'deny', reason: `Path is explicitly forbidden by the task contract: ${relative}` };
  }

  const allowed = contract.allowedPaths ?? [];
  if (allowed.length === 0 || !pathMatchesAny(relative, allowed)) {
    return { permission: 'deny', reason: `Path is outside the task allowlist: ${relative}` };
  }

  return { permission: 'allow', reason: `Authorized by task contract: ${relative}` };
}

export function evaluateShell(command, policy = loadPolicy(), contract = loadContract()) {
  const baselineMentioned = (policy.baselinePaths ?? []).some((p) => command.includes(p));
  if (baselineMentioned && contract?.allowBaselineMutation !== true) {
    return { permission: 'deny', reason: 'Command references a canonical visual baseline without baseline-mutation authorization.' };
  }

  const dangerousGit = new RegExp(policy.dangerousGitPattern);
  if (dangerousGit.test(command) && contract?.allowGitMutation !== true) {
    return { permission: 'ask', reason: 'Git mutation requires explicit human approval for this task.' };
  }

  const dependencyMutation = new RegExp(policy.dependencyMutationPattern);
  if (dependencyMutation.test(command) && contract?.allowDependencyChanges !== true) {
    return { permission: 'ask', reason: 'Dependency mutation requires explicit human approval for this task.' };
  }

  const deployment = new RegExp(policy.deploymentPattern);
  if (deployment.test(command) && contract?.allowDeploy !== true) {
    return { permission: 'ask', reason: 'Deploy/release requires explicit human approval for this task.' };
  }

  return { permission: 'allow', reason: 'Shell command is not blocked by repository policy.' };
}
