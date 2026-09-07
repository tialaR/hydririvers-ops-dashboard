import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { CargoCard } from '@/features/cargo/components/cargo-card';
import { CARGO_LAB_V2_MOCKS } from '@/features/cargo/data/cargo-lab-v2.mock';

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const cargo = CARGO_LAB_V2_MOCKS[0];

describe('CargoCard', () => {
  it('renderiza código, título, origem, destino, status e ETA', () => {
    const html = renderToStaticMarkup(<CargoCard cargo={cargo} index={0} />);

    expect(html).toContain('CRG-7845');
    expect(html).toContain('Eletrônicos e componentes');
    expect(html).toContain('São Paulo, SP');
    expect(html).toContain('Manaus, AM');
    expect(html).toContain('Em trânsito');
    expect(html).toContain('ETA');
    expect(html).toContain('24 Mai, 14:00');
  });

  it('chama onClick ao acionar o card', () => {
    const onClick = vi.fn();
    const element = CargoCard({ cargo, onClick });

    element.props.onClick({ target: {}, currentTarget: {} });
    expect(onClick).toHaveBeenCalledWith(cargo);
  });

  it('expõe semântica de botão e seleção quando o card é a ação', () => {
    const html = renderToStaticMarkup(
      <CargoCard cargo={cargo} onClick={() => undefined} isSelected />,
    );

    expect(html).toContain('role="button"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('data-selected="true"');
    expect(html).toContain('data-interaction-mode="card-button"');
  });

  it('aciona o card por Enter e Espaço', () => {
    const onClick = vi.fn();
    const element = CargoCard({ cargo, onClick });
    const preventDefault = vi.fn();

    element.props.onKeyDown({ key: 'Enter', target: element, currentTarget: element, preventDefault });
    element.props.onKeyDown({ key: ' ', target: element, currentTarget: element, preventDefault });

    expect(preventDefault).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('remove o card desabilitado da ordem de tab e bloqueia a ação', () => {
    const onClick = vi.fn();
    const element = CargoCard({ cargo, onClick, isDisabled: true });
    const html = renderToStaticMarkup(element);

    element.props.onClick({ target: {}, currentTarget: {} });
    expect(onClick).not.toHaveBeenCalled();
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('tabindex="-1"');
  });

  it('renderiza CTA Acompanhar para carga em trânsito', () => {
    const html = renderToStaticMarkup(<CargoCard cargo={cargo} onClick={() => undefined} />);
    expect(html).toContain('Acompanhar');
  });

  it('renderiza CTA Ver detalhes para carga em operação', () => {
    const scheduled = CARGO_LAB_V2_MOCKS[1];
    const html = renderToStaticMarkup(<CargoCard cargo={scheduled} onClick={() => undefined} />);
    expect(html).toContain('Ver detalhes');
    expect(html).toContain('Em operação');
    expect(html).toContain('data-status-tone="operating"');
  });

  it('não renderiza ETA ETA duplicado no card', () => {
    const html = renderToStaticMarkup(
      <CargoCard
        cargo={{ ...cargo, eta: 'ETA 30–42h' }}
        onClick={() => undefined}
      />,
    );

    expect(html).not.toMatch(/ETA[\s\S]*ETA[\s\S]*30–42h/);
    expect(html).toContain('30–42h');
  });

  it('separa label e valor de ETA', () => {
    const html = renderToStaticMarkup(
      <CargoCard cargo={{ ...cargo, eta: 'ETA 4–7 dias' }} onClick={() => undefined} />,
    );

    expect(html).toContain('>ETA<');
    expect(html).toContain('4–7 dias');
    expect(html).not.toContain('ETA ETA');
  });

  it('expõe marker DS v2 de elevação no card light', () => {
    const html = renderToStaticMarkup(<CargoCard cargo={cargo} index={0} />);

    expect(html).toContain('data-ds-v2-cargo-card="true"');
  });

  it('renderiza CTA como link quando primaryActionHref está definido', () => {
    const html = renderToStaticMarkup(
      <CargoCard
        cargo={cargo}
        onClick={() => undefined}
        actionLabel="Ver detalhes"
        primaryActionHref="/cargas/CRG-7845/mapa"
      />,
    );

    expect(html).toContain('href="/cargas/CRG-7845/mapa"');
    expect(html).toContain('data-public-cargo-action="true"');
    expect(html).toContain('Ver detalhes');
    expect(html).not.toContain('Ver rota');
    expect(html).not.toContain('role="button"');
    expect(html).toContain('data-interaction-mode="direct-action"');
  });

  it('não expõe link acionável quando o card está desabilitado', () => {
    const html = renderToStaticMarkup(
      <CargoCard
        cargo={cargo}
        onClick={() => undefined}
        primaryActionHref="/cargas/CRG-7845/mapa"
        isDisabled
      />,
    );

    expect(html).not.toContain('href=');
    expect(html).toContain('role="button"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('aria-disabled="true"');
  });
});
