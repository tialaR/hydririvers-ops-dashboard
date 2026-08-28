import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/features/profile/screens/profile-screen', () => ({ ProfileScreen: () => React.createElement('div', { 'data-testid': 'shipper-profile-screen' }) }));
import ProfilePage from '@/app/[locale]/(shipper-mobile-flow)/perfil/page';
describe('profile page (shipper mobile flow)', () => { it('renderiza a tela de perfil da embarcadora', () => { const tree = ProfilePage(); const html = renderToStaticMarkup(tree as React.ReactElement); expect(html).toContain('shipper-profile-screen'); }); });
