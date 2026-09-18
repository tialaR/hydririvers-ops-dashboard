#!/usr/bin/env node
import { evaluateWrite } from '../../scripts/governance/agentic-policy.mjs';

let input = '';
process.stdin.setEncoding('utf8');
for await (const chunk of process.stdin) input += chunk;

try {
  const payload = JSON.parse(input || '{}');
  const filePath = payload.tool_input?.file_path ?? payload.tool_input?.path ?? '';
  const result = evaluateWrite(filePath);
  const allowed = result.permission === 'allow';
  process.stdout.write(JSON.stringify({
    permission: allowed ? 'allow' : 'deny',
    user_message: allowed ? undefined : result.reason,
    agent_message: allowed ? undefined : `STOP. ${result.reason} Do not bypass the task contract.`
  }));
} catch (error) {
  process.stdout.write(JSON.stringify({
    permission: 'deny',
    user_message: 'Agentic write guard could not validate this write.',
    agent_message: `STOP. Write guard error: ${error instanceof Error ? error.message : String(error)}`
  }));
}
