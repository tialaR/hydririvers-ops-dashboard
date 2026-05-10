import { z } from 'zod';

const optionalText = z.string().trim().optional().transform((value) => {
  const next = value?.trim();
  return next ? next : undefined;
});

export const cargoProposalSchema = z.object({
  amount: z.string().trim().min(1, 'cargo-proposal-amount-required'),
  estimatedTime: optionalText,
  vesselCompatibility: optionalText,
  documentCommitment: z.enum(['ready', 'pending']),
  operationPlan: optionalText,
  contactChannel: optionalText,
  riskNote: optionalText
});

export type CargoProposalInput = z.infer<typeof cargoProposalSchema>;
