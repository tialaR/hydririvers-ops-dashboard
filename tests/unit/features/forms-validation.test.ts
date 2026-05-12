import { describe, expect, it } from 'vitest';
import { cargoProposalSchema } from '@/features/cargo-market/domain/cargo-proposal.schema';
import { newCargoFormSchema } from '@/features/cargo-market/domain/new-cargo-form.schema';
import { profileFormSchema } from '@/features/auth/domain/profile.schema';

describe('forms validation schemas', () => {
  it('validates and normalizes new cargo payloads', () => {
    const result = newCargoFormSchema.safeParse({
      origin: ' Belém, PA ',
      destination: 'Santarém, PA',
      cargoType: 'Açaí refrigerado',
      volume: '18 t',
      window: '08-12 maio',
      targetPrice: 'R$ 8.400',
      description: ' Carga refrigerada para entrega regional '
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.origin).toBe('Belém, PA');
    expect(result.data.description).toBe('Carga refrigerada para entrega regional');
  });

  it('rejects new cargo payloads without required fields', () => {
    const result = newCargoFormSchema.safeParse({
      origin: '',
      destination: '',
      cargoType: '',
      volume: '',
      window: '',
      targetPrice: '',
      description: ''
    });

    expect(result.success).toBe(false);
  });

  it('validates and normalizes profile payloads', () => {
    const result = profileFormSchema.safeParse({
      name: ' Tiala Rocha ',
      email: ' TIALA@EXAMPLE.COM ',
      company: ' HydroRivers ',
      phone: ' +55 91 99999-0001 ',
      city: '  Belém, PA  ',
      avatarUrl: '  '
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.name).toBe('Tiala Rocha');
    expect(result.data.email).toBe('tiala@example.com');
    expect(result.data.phone).toBe('+5591999990001');
    expect(result.data.city).toBe('Belém, PA');
    expect(result.data.avatarUrl).toBeUndefined();
  });

  it('rejects profile payloads without required fields', () => {
    const result = profileFormSchema.safeParse({
      name: '',
      email: '',
      company: '',
      phone: '',
      city: '',
      avatarUrl: undefined
    });

    expect(result.success).toBe(false);
  });

  it('rejects profile phone without country code prefix', () => {
    const result = profileFormSchema.safeParse({
      name: 'Tiala Rocha',
      email: 'tiala@example.com',
      company: 'HydroRivers',
      phone: '91999990001',
      city: 'Belém, PA',
      avatarUrl: undefined
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.some((i) => i.message === 'profile-phone-no-country')).toBe(true);
  });

  it('validates cargo proposal payloads', () => {
    const result = cargoProposalSchema.safeParse({
      amount: 'R$ 8.500',
      estimatedTime: ' 36h ',
      vesselCompatibility: '  reefer  ',
      documentCommitment: 'ready',
      operationPlan: '  Operar no turno da manhã ',
      contactChannel: ' WhatsApp ',
      riskNote: '  Ajustar janela se houver chuva '
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.estimatedTime).toBe('36h');
    expect(result.data.vesselCompatibility).toBe('reefer');
    expect(result.data.documentCommitment).toBe('ready');
  });
});
