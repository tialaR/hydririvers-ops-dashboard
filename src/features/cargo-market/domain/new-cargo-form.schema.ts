import { z } from 'zod';

const requiredCargoField = (message: string) => z.string().trim().min(1, message);

export const newCargoFormSchema = z.object({
  origin: requiredCargoField('origin-required'),
  destination: requiredCargoField('destination-required'),
  cargoType: requiredCargoField('cargo-type-required'),
  volume: requiredCargoField('volume-required'),
  window: requiredCargoField('window-required'),
  targetPrice: requiredCargoField('target-price-required'),
  description: requiredCargoField('description-required')
});

export type NewCargoFormInput = z.infer<typeof newCargoFormSchema>;

