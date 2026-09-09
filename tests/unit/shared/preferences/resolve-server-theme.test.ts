import { describe, expect, it } from 'vitest';
import {
  DEFAULT_STORED_THEME,
  resolveServerTheme
} from '@/shared/preferences/resolve-server-theme';

describe('resolveServerTheme', () => {
  it('usa light como tema padrão global sem cookie', () => {
    expect(DEFAULT_STORED_THEME).toBe('light');
    expect(resolveServerTheme(undefined)).toBe('light');
  });

  it('resolve light quando o cookie é light', () => {
    expect(resolveServerTheme('light')).toBe('light');
  });

  it('resolve dark quando o cookie é dark', () => {
    expect(resolveServerTheme('dark')).toBe('dark');
  });

  it('ignora valores inválidos e volta para light', () => {
    expect(resolveServerTheme('purple')).toBe('light');
    expect(resolveServerTheme('')).toBe('light');
  });
});
