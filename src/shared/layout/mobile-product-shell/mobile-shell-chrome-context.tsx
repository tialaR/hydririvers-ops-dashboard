'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type MobileShellChromeContextValue = {
  bottomNavSuppressed: boolean;
  setBottomNavSuppressed: (suppressed: boolean) => void;
};

const MobileShellChromeContext = createContext<MobileShellChromeContextValue | null>(null);

export function MobileShellChromeProvider({ children }: { children: ReactNode }) {
  const [bottomNavSuppressed, setBottomNavSuppressed] = useState(false);
  const value = useMemo(
    () => ({
      bottomNavSuppressed,
      setBottomNavSuppressed,
    }),
    [bottomNavSuppressed],
  );

  return (
    <MobileShellChromeContext.Provider value={value}>{children}</MobileShellChromeContext.Provider>
  );
}

export function useMobileShellChrome() {
  const context = useContext(MobileShellChromeContext);
  if (!context) {
    return {
      bottomNavSuppressed: false,
      setBottomNavSuppressed: () => undefined,
    };
  }

  return context;
}
