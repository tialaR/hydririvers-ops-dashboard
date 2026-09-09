'use client';

import {
  LiquidGlassSheet,
  type LiquidGlassSheetPlacement,
  type LiquidGlassSheetProps,
  type LiquidGlassSheetRole,
  type LiquidGlassSheetSnapPoint,
  type LiquidGlassSheetTone,
  type LiquidGlassSheetVariant,
} from '../../primitives/liquid-glass-sheet/liquid-glass-sheet';

export type BottomSheetPlacement = LiquidGlassSheetPlacement;
export type BottomSheetRole = LiquidGlassSheetRole;
export type BottomSheetSnapPoint = LiquidGlassSheetSnapPoint;
export type BottomSheetTone = LiquidGlassSheetTone;
export type BottomSheetVariant = LiquidGlassSheetVariant;
export type BottomSheetProps = LiquidGlassSheetProps;

/**
 * Neutral interactive sheet adapter.
 *
 * Drag, snap, focus and visual-material behavior remain encapsulated behind the
 * design-system boundary while consumers stop depending on implementation names.
 */
export const BottomSheet = LiquidGlassSheet;
