'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Cargo } from '@/features/marketplace/domain/marketplace.types';

type CargoListState = {
  cargos: Cargo[];
  isLoading: boolean;
  error: string | null;
};

async function fetchCargoes() {
  const response = await fetch('/api/cargas', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('cargoes-request-failed');
  }

  const payload = (await response.json()) as { data?: Cargo[] };
  return Array.isArray(payload.data) ? payload.data : [];
}

async function fetchCurrentUserId() {
  const response = await fetch('/api/auth/me', { cache: 'no-store' });
  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { user?: { id?: string } | null };
  return payload.user?.id ?? null;
}

export function usePublicCargos() {
  const [state, setState] = useState<CargoListState>({ cargos: [], isLoading: true, error: null });

  useEffect(() => {
    let active = true;

    fetchCargoes()
      .then((cargoes) => {
        if (!active) return;
        setState({ cargos: cargoes.filter((cargo) => cargo.visibility === 'public'), isLoading: false, error: null });
      })
      .catch(() => {
        if (!active) return;
        setState({ cargos: [], isLoading: false, error: 'cargoes-request-failed' });
      });

    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => state, [state]);
}

export function useCurrentUserCargos(userId?: string | null) {
  const [state, setState] = useState<CargoListState>({ cargos: [], isLoading: true, error: null });

  useEffect(() => {
    let active = true;

    Promise.all([fetchCargoes(), userId ? Promise.resolve(userId) : fetchCurrentUserId()])
      .then(([cargoes, resolvedUserId]) => {
        if (!active) return;
        const currentUserCargos = resolvedUserId
          ? cargoes.filter((cargo) => cargo.ownerId === resolvedUserId || cargo.shipperId === resolvedUserId || cargo.carrierId === resolvedUserId)
          : [];

        setState({ cargos: currentUserCargos, isLoading: false, error: null });
      })
      .catch(() => {
        if (!active) return;
        setState({ cargos: [], isLoading: false, error: 'cargoes-request-failed' });
      });

    return () => {
      active = false;
    };
  }, [userId]);

  return useMemo(() => state, [state]);
}
