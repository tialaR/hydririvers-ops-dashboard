import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockIsMobileCargoListLabRouteEnabled = vi.hoisted(() => vi.fn());

vi.mock('@/shared/config/env', () => ({
  isMobileCargoListLabRouteEnabled: mockIsMobileCargoListLabRouteEnabled,
}));

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

vi.mock('@/features/cargo/services/cargo-list.service', () => ({
  cargoListService: {
    getMobileCargoListViewModel: vi.fn().mockResolvedValue({
      items: [],
      filters: { chips: [] },
      totalCount: 0,
    }),
  },
}));

vi.mock('@/features/cargo/components/mobile-list-lab/mobile-cargo-list-lab', () => ({
  MobileCargoListLab: () => null,
}));

import MobileCargoListLabPage from '@/app/[locale]/dev/mobile-cargo-list-lab/page';

describe('mobile-cargo-list-lab page guard', () => {
  beforeEach(() => {
    mockIsMobileCargoListLabRouteEnabled.mockReset();
  });

  it('bloqueia rota quando guard dev está desabilitado', async () => {
    mockIsMobileCargoListLabRouteEnabled.mockReturnValue(false);

    await expect(
      MobileCargoListLabPage({ params: Promise.resolve({ locale: 'pt-BR' }) }),
    ).rejects.toThrow();
  });
});
