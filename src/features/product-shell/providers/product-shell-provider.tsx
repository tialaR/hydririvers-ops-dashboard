'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { AuthExperienceUser } from '@/features/auth/domain/auth-experience-types';
import '@/features/product-shell/styles/product-shell-chrome-overrides.module.sass';

type ConfirmationConfig = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
};

type ProductShellContextValue = {
  currentUser: AuthExperienceUser;
  confirmation: ConfirmationConfig | null;
  openConfirmation: (config: ConfirmationConfig) => void;
  closeConfirmation: () => void;
  avatarSheetOpen: boolean;
  setAvatarSheetOpen: (open: boolean) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
};

const ProductShellContext = createContext<ProductShellContextValue | null>(null);

const anonymousUser: AuthExperienceUser = {
  id: 'anonymous',
  name: 'Visitante',
  company: 'HydroRivers',
  role: 'shipper',
  avatarInitials: '?',
  locale: 'pt-BR',
};

export function ProductShellProvider({
  children,
  currentUser
}: {
  children: ReactNode;
  currentUser: AuthExperienceUser | null;
}) {
  const presentedUser = currentUser ?? anonymousUser;
  useEffect(() => {
    document.documentElement.dataset.shipperMobileFlow = 'true';
    return () => {
      delete document.documentElement.dataset.shipperMobileFlow;
    };
  }, []);

  const [confirmation, setConfirmation] = useState<ConfirmationConfig | null>(null);
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const openConfirmation = useCallback((config: ConfirmationConfig) => {
    setConfirmation(config);
  }, []);

  const closeConfirmation = useCallback(() => {
    setConfirmation(null);
  }, []);

  const value = useMemo(
    () => ({
      currentUser: presentedUser,
      confirmation,
      openConfirmation,
      closeConfirmation,
      avatarSheetOpen,
      setAvatarSheetOpen,
      activeFilter,
      setActiveFilter
    }),
    [
      presentedUser,
      confirmation,
      openConfirmation,
      closeConfirmation,
      avatarSheetOpen,
      activeFilter
    ]
  );

  return <ProductShellContext.Provider value={value}>{children}</ProductShellContext.Provider>;
}

export function useProductShell(): ProductShellContextValue {
  const context = useContext(ProductShellContext);
  if (!context) {
    throw new Error('useProductShell must be used within ProductShellProvider');
  }
  return context;
}
