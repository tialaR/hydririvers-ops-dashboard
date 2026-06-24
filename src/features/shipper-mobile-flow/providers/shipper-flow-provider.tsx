'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { ShipperUser } from '@/features/shipper-mobile-flow/types/shipper-flow-types';
import '@/features/shipper-mobile-flow/styles/shipper-flow-chrome-overrides.module.sass';

type ConfirmationConfig = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
};

type ShipperFlowContextValue = {
  currentUser: ShipperUser;
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  confirmation: ConfirmationConfig | null;
  openConfirmation: (config: ConfirmationConfig) => void;
  closeConfirmation: () => void;
  avatarSheetOpen: boolean;
  setAvatarSheetOpen: (open: boolean) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
};

const ShipperFlowContext = createContext<ShipperFlowContextValue | null>(null);

export function ShipperFlowProvider({
  children,
  currentUser
}: {
  children: ReactNode;
  currentUser: ShipperUser;
}) {
  useEffect(() => {
    document.documentElement.dataset.shipperMobileFlow = 'true';
    return () => {
      delete document.documentElement.dataset.shipperMobileFlow;
    };
  }, []);

  const [isAuthenticated, setAuthenticated] = useState(false);
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
      currentUser,
      isAuthenticated,
      setAuthenticated,
      confirmation,
      openConfirmation,
      closeConfirmation,
      avatarSheetOpen,
      setAvatarSheetOpen,
      activeFilter,
      setActiveFilter
    }),
    [
      currentUser,
      isAuthenticated,
      confirmation,
      openConfirmation,
      closeConfirmation,
      avatarSheetOpen,
      activeFilter
    ]
  );

  return <ShipperFlowContext.Provider value={value}>{children}</ShipperFlowContext.Provider>;
}

export function useShipperFlow(): ShipperFlowContextValue {
  const context = useContext(ShipperFlowContext);
  if (!context) {
    throw new Error('useShipperFlow must be used within ShipperFlowProvider');
  }
  return context;
}
