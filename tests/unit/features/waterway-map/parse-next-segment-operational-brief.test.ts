import { describe, expect, it } from 'vitest';

import { parseNextSegmentOperationalBrief } from '@/features/waterway-map/utils/parse-next-segment-operational-brief';

describe('parseNextSegmentOperationalBrief', () => {
  it('divide contexto, situação e impacto do resumo operacional', () => {
    const brief = parseNextSegmentOperationalBrief(
      'Carga refrigerada Belém→Santarém: calado em atenção no trecho médio; revisar ETA com embarcador.',
    );

    expect(brief).toEqual({
      context: 'Carga refrigerada Belém→Santarém',
      situation: 'Calado em atenção no trecho médio',
      impact: 'Revisar ETA com embarcador',
    });
  });

  it('aceita separador com travessão', () => {
    const brief = parseNextSegmentOperationalBrief(
      'Grãos Marabá→Vila do Conde: dragagem crítica e fila no destino — ETA e custo em risco.',
    );

    expect(brief?.context).toBe('Grãos Marabá→Vila do Conde');
    expect(brief?.situation).toMatch(/dragagem/i);
    expect(brief?.impact).toContain('ETA');
  });

  it('retorna undefined para texto vazio', () => {
    expect(parseNextSegmentOperationalBrief('   ')).toBeUndefined();
  });
});
