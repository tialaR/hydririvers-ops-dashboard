import type { ReactNode } from 'react';

import { MinhasCargasAuthGate } from '@/features/cargo-market/components/minhas-cargas-auth-gate/minhas-cargas-auth-gate';

type MinhasCargasLayoutProps = {
  children: ReactNode;
};

/** Client gate evita flash de conteúdo privado após logout; redirect HTTP via middleware + RSC. */
export default function MinhasCargasLayout({ children }: MinhasCargasLayoutProps) {
  return <MinhasCargasAuthGate>{children}</MinhasCargasAuthGate>;
}
