import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

import messages from '../../../../../../messages/pt-BR.json';

export function OwnedCargoSheetStoryFrame({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="pt-BR" messages={messages} timeZone="America/Bahia">
      <div style={{ width: 'min(100%, 430px)', minHeight: '760px' }}>{children}</div>
    </NextIntlClientProvider>
  );
}
