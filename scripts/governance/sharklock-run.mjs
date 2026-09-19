#!/usr/bin/env node
import { mkdirSync, readFileSync } from 'node:fs';
import { openSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';

const args = process.argv.slice(2);
const manifestArg = args.find((arg) => arg.startsWith('--manifest='));
const manifestName = manifestArg?.slice('--manifest='.length);
const skipBuild = args.includes('--skip-build');

if (!manifestName) {
  console.error('SHARKLOCK FAIL: --manifest=<name> is required');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(path.resolve('config/visual-gates', `${manifestName}.json`), 'utf8'));
const candidate = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
const baseUrl = manifest.baseUrl ?? 'http://127.0.0.1:3100';
const healthUrl = `${baseUrl}${manifest.healthPath ?? '/pt-BR/login'}`;
const evidenceDir = path.resolve(path.dirname(manifest.runtimeArtifact), 'logs');
mkdirSync(evidenceDir, { recursive: true });

function run(command, commandArgs, env = {}) {
  const result = spawnSync(command, commandArgs, {
    stdio: 'inherit',
    shell: false,
    env: { ...process.env, ...env }
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

if (!skipBuild) run('npm', ['run', 'build']);

const runtimeLog = openSync(path.join(evidenceDir, 'runtime.log'), 'w');
const runtimeEnv = {
  ...process.env,
  HYDRORIVERS_EXPOSE_OTP_CODE: 'true',
  HYDRORIVERS_ALLOW_MOCK_MODE_RESET: 'true',
  HYDRORIVERS_FORCE_MOCK_QA_UI: 'true',
  HYDRORIVERS_FORCE_QA_DIRECT_LOGIN: 'true'
};

const server = spawn('npm', ['run', 'start', '--', '--hostname', '127.0.0.1', '--port', '3100'], {
  stdio: ['ignore', runtimeLog, runtimeLog],
  env: runtimeEnv,
  shell: false
});

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`runtime exited with code ${server.exitCode}`);
    try {
      const response = await fetch(healthUrl);
      if (response.ok || response.status < 500) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error(`runtime did not become healthy: ${healthUrl}`);
}

try {
  await waitForServer();
  run('node', ['scripts/governance/sharklock-capture.mjs', `--manifest=${manifestName}`], {
    SHARKLOCK_CANDIDATE_SHA: candidate
  });
  run('node', ['scripts/governance/sharklock-certify.mjs', `--manifest=${manifestName}`], {
    SHARKLOCK_CANDIDATE_SHA: candidate
  });
} catch (error) {
  console.error(`SHARKLOCK FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  server.kill('SIGTERM');
}
