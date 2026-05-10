export const zIndex = {
  base: 0,
  sticky: 10,
  header: 30,
  bottomNav: 40,
  floatingAction: 45,
  overlay: 80,
  bottomSheet: 90,
  modal: 100,
  toast: 110
} as const;

export type ZIndexToken = keyof typeof zIndex;
