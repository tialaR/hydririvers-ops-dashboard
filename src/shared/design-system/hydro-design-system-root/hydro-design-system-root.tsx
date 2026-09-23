import type { ReactNode } from 'react';
// Global token sheets — :root and [data-hydro-theme] (see hydro-kit.css).
import '../tokens/generated/hydro-kit.css';
import '../tokens/generated/hydro.semantic.css';
import '../foundations/page-61-contract-tokens.css';

type HydroDesignSystemRootProps = {
  children: ReactNode;
};

/**
 * Loads Hydro DS CSS variables globally. Feature code should use semantic CSS variables
 * after this root is mounted in the locale layout; do not duplicate token imports.
 */
export function HydroDesignSystemRoot({ children }: HydroDesignSystemRootProps) {
  return <>{children}</>;
}
