import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import {
  MOBILE_CARGO_LIST_LAB_SHEET_SCROLL_LOCK_CLASS,
  applyMobileCargoListLabSheetScrollLock,
} from '@/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab';

const labStylesPath = resolve(
  process.cwd(),
  'src/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab.module.scss',
);

function createClassListSpy() {
  const classes = new Set<string>();
  return {
    add: vi.fn((name: string) => {
      classes.add(name);
    }),
    remove: vi.fn((name: string) => {
      classes.delete(name);
    }),
    contains: (name: string) => classes.has(name),
    classes,
  };
}

describe('mobile cargo list lab sheet scroll lock', () => {
  it('é no-op em ambiente sem document (SSR/node)', () => {
    expect(() => applyMobileCargoListLabSheetScrollLock(true)).not.toThrow();
    expect(() => applyMobileCargoListLabSheetScrollLock(false)).not.toThrow();
  });

  it('aplica e remove a classe de lock no html e body', () => {
    const htmlClassList = createClassListSpy();
    const bodyClassList = createClassListSpy();

    vi.stubGlobal('document', {
      documentElement: { classList: htmlClassList },
      body: { classList: bodyClassList },
    });

    applyMobileCargoListLabSheetScrollLock(true);

    expect(htmlClassList.add).toHaveBeenCalledWith(MOBILE_CARGO_LIST_LAB_SHEET_SCROLL_LOCK_CLASS);
    expect(bodyClassList.add).toHaveBeenCalledWith(MOBILE_CARGO_LIST_LAB_SHEET_SCROLL_LOCK_CLASS);
    expect(htmlClassList.classes.has(MOBILE_CARGO_LIST_LAB_SHEET_SCROLL_LOCK_CLASS)).toBe(true);
    expect(bodyClassList.classes.has(MOBILE_CARGO_LIST_LAB_SHEET_SCROLL_LOCK_CLASS)).toBe(true);

    applyMobileCargoListLabSheetScrollLock(false);

    expect(htmlClassList.remove).toHaveBeenCalledWith(MOBILE_CARGO_LIST_LAB_SHEET_SCROLL_LOCK_CLASS);
    expect(bodyClassList.remove).toHaveBeenCalledWith(MOBILE_CARGO_LIST_LAB_SHEET_SCROLL_LOCK_CLASS);
    expect(htmlClassList.classes.has(MOBILE_CARGO_LIST_LAB_SHEET_SCROLL_LOCK_CLASS)).toBe(false);
    expect(bodyClassList.classes.has(MOBILE_CARGO_LIST_LAB_SHEET_SCROLL_LOCK_CLASS)).toBe(false);

    vi.unstubAllGlobals();
  });

  it('declara bloqueio de scroll da lista e do shell admin no CSS do lab', () => {
    const source = readFileSync(labStylesPath, 'utf8');

    expect(source).toContain(MOBILE_CARGO_LIST_LAB_SHEET_SCROLL_LOCK_CLASS);
    expect(source).toContain(".root[data-sheet-open='true'] .listScroller");
    expect(source).toContain('overflow: hidden');
    expect(source).toContain('overscroll-behavior: contain');
    expect(source).toContain('.listScroller');
    expect(source).toContain('.sheetOverlay');
    expect(source).toContain('.hr-dashboard-scroll');
    expect(source).toContain("data-sheet-open='true'] .listScroller");
    expect(source).toContain('.filterScroll');
    expect(source).toContain('height: 100dvh');
    expect(source).toContain('.sheetHeader');
    expect(source).toContain('.sheetActionGroup');
  });
});
