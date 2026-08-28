import { existsSync, readFileSync } from 'node:fs';
const root=process.cwd();
const read=(p)=>readFileSync(`${root}/${p}`,'utf8');
const mockMode=read('src/shared/ui/mock-mode/mock-mode.tsx');
const required=[
  'src/shared/ui/mock-mode/mock-qa-hub.tsx',
  'src/shared/ui/mock-mode/mock-scenario-control.tsx',
  'src/app/api/mock-mode/login-as/route.ts',
  'src/app/api/mock-mode/route.ts'
];
for (const p of required) if (!existsSync(`${root}/${p}`)) throw new Error(`required Dev Assist capability missing: ${p}`);
for (const p of [
  'src/shared/ui/mock-mode/mock-qa-assistant.tsx',
  'src/shared/ui/mock-mode/mock-qa-scenarios.ts',
  'tests/unit/shared/ui/mock-qa-scenarios.test.ts'
]) if (existsSync(`${root}/${p}`)) throw new Error(`retired QA Assistant artifact still exists: ${p}`);
if (mockMode.includes('MockQaAssistant') || mockMode.includes('mock-qa-assistant')) throw new Error('MockMode still renders legacy QA Assistant');
if (!mockMode.includes('<MockScenarioControl />')) throw new Error('scenario control must stay in Dev Assist');
if (!mockMode.includes('<MockQaHubPersonas />')) throw new Error('persona direct-login hub must stay in Dev Assist');
console.log('[shark-diamond-mock-w01] PASS');
console.log(' legacy QA scenario encyclopedia: retired');
console.log(' Dev Assist preserved: scenario switch + persona credentials/direct entry');
