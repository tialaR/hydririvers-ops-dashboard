import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const rootPagePath = resolve(process.cwd(), 'src/app/page.tsx');

describe('portfolio root entry', () => {
  const source = readFileSync(rootPagePath, 'utf8');

  it('redirects the repository root through the canonical locale contract', () => {
    expect(source).toContain("cookieNames.locale");
    expect(source).toContain('hasLocale(routing.locales, requestedLocale)');
    expect(source).toContain('routing.defaultLocale');
    expect(source).toContain('redirect(`/${locale}`)');
  });
});
