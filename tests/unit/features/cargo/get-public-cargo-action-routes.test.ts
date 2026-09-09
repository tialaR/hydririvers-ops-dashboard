import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { getPublicCargoActionRoutes } from '@/features/cargo/utils/get-public-cargo-action-routes';

describe('getPublicCargoActionRoutes', () => {
  const labels = {
    detail: { label: 'Detalhes da carga', description: 'Página completa' },
    route: { label: 'Ver rota', description: 'Mapa hidroviário' },
    documents: { label: 'Documentos da carga', description: 'Pacote documental' },
    costs: { label: 'Custos e valores', description: 'Resumo financeiro' },
    priority: { label: 'Prioridade e riscos', description: 'SLA operacional' },
    negotiations: { label: 'Abrir negociações', description: 'Ver propostas' },
  };

  it('retorna hrefs relativos ao locale (sem prefixo duplicado)', () => {
    const actions = getPublicCargoActionRoutes('CRG-7845', labels);

    expect(actions).toHaveLength(6);
    expect(actions.map((action) => action.id)).toEqual([
      'detail',
      'route',
      'documents',
      'costs',
      'priority',
      'negotiations',
    ]);
    expect(actions[0]?.href).toBe('/cargas/CRG-7845');
    expect(actions[1]?.href).toBe('/cargas/CRG-7845/mapa');
    expect(actions[2]?.href).toBe('/cargas/CRG-7845?view=documentos');
    expect(actions[3]?.href).toBe('/cargas/CRG-7845?view=custos');
    expect(actions[4]?.href).toBe('/cargas/CRG-7845?view=prioridade');
    expect(actions[5]?.href).toBe('/negociacoes');
    expect(actions.every((action) => !action.href.includes('/pt-BR/pt-BR'))).toBe(true);
    expect(actions.every((action) => !action.href.startsWith('/pt-BR/'))).toBe(true);
  });

  it('preserva mapeamento de abas admin via ?view= e rota de mapa dedicada', () => {
    const actions = getPublicCargoActionRoutes('cargo-1', labels);

    expect(actions.some((action) => action.href.includes('view=documentos'))).toBe(true);
    expect(actions.some((action) => action.href.includes('view=custos'))).toBe(true);
    expect(actions.some((action) => action.href.includes('view=prioridade'))).toBe(true);
    expect(actions.some((action) => action.href.endsWith('/mapa'))).toBe(true);
  });
});

describe('getPublicCargoActionRoutes i18n keys', () => {
  const locales = ['pt-BR', 'en-US', 'es'] as const;
  const requiredKeys = [
    'operationsBoard.list.publicMobileSearchPlaceholder',
    'operationsBoard.list.cardActionRoute',
    'operationsBoard.publicActionSheet.detailTitle',
    'operationsBoard.publicActionSheet.routeTitle',
    'operationsBoard.publicActionSheet.documentsTitle',
    'operationsBoard.publicActionSheet.costsTitle',
    'operationsBoard.publicActionSheet.priorityTitle',
    'operationsBoard.publicActionSheet.negotiationsTitle',
  ];

  function flatten(value: unknown, prefix = ''): string[] {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.entries(value).flatMap(([key, nested]) =>
        flatten(nested, prefix ? `${prefix}.${key}` : key),
      );
    }

    return [prefix];
  }

  it('expõe chaves públicas mobile nos 3 locales', () => {
    for (const locale of locales) {
      const messages = JSON.parse(
        readFileSync(resolve(process.cwd(), `messages/${locale}.json`), 'utf8'),
      );
      const keys = new Set(flatten(messages));

      for (const key of requiredKeys) {
        expect(keys.has(key), `${locale} missing ${key}`).toBe(true);
      }
    }
  });

  it('usa placeholder Buscar cargas... em pt-BR', () => {
    const messages = JSON.parse(
      readFileSync(resolve(process.cwd(), 'messages/pt-BR.json'), 'utf8'),
    );

    expect(messages.operationsBoard.list.publicMobileSearchPlaceholder).toBe('Buscar cargas...');
    expect(messages.operationsBoard.list.cardActionRoute).toBe('Ver rota');
  });
});
