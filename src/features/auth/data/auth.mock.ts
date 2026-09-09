import type { HydroUser } from '../domain/auth.types';
import { toHydroUsers } from '@/shared/mock-data/mock-user-registry';

/** Usuários seed derivados do registry canônico (`mock-user-registry.ts`). */
export const defaultUsers: HydroUser[] = toHydroUsers();
