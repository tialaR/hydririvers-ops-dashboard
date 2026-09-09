import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type PressableSurfaceProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  selected?: boolean;
};

export function PressableSurface({ children, selected = false, type = 'button', ...props }: PressableSurfaceProps) {
  return (
    <button type={type} aria-pressed={selected || undefined} {...props}>
      {children}
    </button>
  );
}
