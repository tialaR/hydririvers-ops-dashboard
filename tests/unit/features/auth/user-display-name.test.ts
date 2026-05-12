import { describe, expect, it } from 'vitest';

import { getCompactDisplayInitials, getCompactUserDisplayName } from '@/features/auth/domain/user-display-name';

describe('getCompactUserDisplayName', () => {
  it('reduz para primeiro nome + ultimo sobrenome e normaliza caixa alta', () => {
    expect(getCompactUserDisplayName('TIALA FERNANDA DE SA ROCHA')).toBe('Tiala Rocha');
  });

  it('preserva acentos', () => {
    expect(getCompactUserDisplayName('TIALA FERNANDA DE SÁ ROCHA')).toBe('Tiala Rocha');
  });

  it('mantem nome unico', () => {
    expect(getCompactUserDisplayName('Maria')).toBe('Maria');
  });

  it('remove particulas intermediarias quando possivel', () => {
    expect(getCompactUserDisplayName('Ana Clara de Oliveira Souza')).toBe('Ana Souza');
  });

  it('compacta João Pedro Silva para primeiro e ultimo sobrenome', () => {
    expect(getCompactUserDisplayName('João Pedro Silva')).toBe('João Silva');
  });

  it('compacta nome longo com SANTANA no meio', () => {
    expect(getCompactUserDisplayName('TIALA FERNANDA DE SANTANA ROCHA')).toBe('Tiala Rocha');
  });
});

describe('getCompactDisplayInitials', () => {
  it('usa primeiro e ultimo token do nome compacto', () => {
    expect(getCompactDisplayInitials('João Pedro Silva')).toBe('JS');
    expect(getCompactDisplayInitials('TIALA FERNANDA DE SA ROCHA')).toBe('TR');
  });

  it('preserva nome unico', () => {
    expect(getCompactDisplayInitials('Maria')).toBe('MA');
  });
});

