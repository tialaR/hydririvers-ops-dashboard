export const zIndex = {
  base: 0,
  sticky: 10,
  header: 100,
  bottomNav: 200,
  dropdown: 300,
  popover: 500,
  floatingAction: 650,
  overlay: 680,
  bottomSheet: 700,
  modal: 900,
  toast: 1000
} as const;

export type ZIndexToken = keyof typeof zIndex;
