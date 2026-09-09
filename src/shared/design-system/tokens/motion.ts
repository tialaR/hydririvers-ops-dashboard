/** Durações e curvas de animação (CSS-friendly). */
export const motion = {
  durationFast: '120ms',
  durationNormal: '220ms',
  durationSlow: '320ms',
  easingStandard: 'cubic-bezier(0.2, 0, 0, 1)',
  easingEmphasized: 'cubic-bezier(0.2, 0, 0, 1.2)',
} as const;

export type MotionToken = keyof typeof motion;
