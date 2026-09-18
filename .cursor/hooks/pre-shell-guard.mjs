#!/usr/bin/env node
import { evaluateShell } from '../../scripts/governance/agentic-policy.mjs';

let input = '';
process.stdin.setEncoding('utf8');
for await (const chunk of process.stdin) input += chunk;

try {
  const payload = JSON.parse(input || '{}');
  const command = payload.command ?? payload.tool_input?.command ?? '';
  const result = evaluateShell(command);
  process.stdout.write(JSON.stringify({
    permission: result.permission,
    user_message: result.permission === 'allow' ? undefined : result.reason,
    agent_message: result.permission === 'allow' ? undefined : `This action needs a human decision: ${result.reason}`
  }));
} catch (error) {
  process.stdout.write(JSON.stringify({
    permission: 'deny',
    user_message: 'Agentic shell guard could not validate this command.',
    agent_message: `STOP. Shell guard error: ${error instanceof Error ? error.message : String(error)}`
  }));
}
