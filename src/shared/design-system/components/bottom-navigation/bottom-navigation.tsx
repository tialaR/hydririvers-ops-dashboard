'use client';

import {
  LiquidGlassBottomDock,
  type LiquidGlassBottomDockItem,
  type LiquidGlassBottomDockProps,
  type LiquidGlassBottomDockTone,
} from '../../primitives/liquid-glass-bottom-dock';

export type BottomNavigationItem = LiquidGlassBottomDockItem;
export type BottomNavigationTone = LiquidGlassBottomDockTone;
export type BottomNavigationProps = LiquidGlassBottomDockProps;

/**
 * Neutral navigation adapter.
 *
 * The current visual implementation stays private to the design-system boundary.
 * Product code consumes the semantic name and can be migrated independently later.
 */
export const BottomNavigation = LiquidGlassBottomDock;
