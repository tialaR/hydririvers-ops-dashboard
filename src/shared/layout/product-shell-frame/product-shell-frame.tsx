import type { HTMLAttributes, ReactNode } from 'react';

type ProductShellDataAttributes = {
  [key: `data-${string}`]: string | number | boolean | undefined;
};

type ProductShellFrameProps = {
  children: ReactNode;
  header?: ReactNode;
  navigation?: ReactNode;
  overlays?: ReactNode;
  rootClassName?: string;
  mainClassName?: string;
  contentClassName?: string;
  rootAttributes?: HTMLAttributes<HTMLDivElement> & ProductShellDataAttributes;
};

export function ProductShellFrame({
  children,
  header,
  navigation,
  overlays,
  rootClassName,
  mainClassName,
  contentClassName,
  rootAttributes,
}: ProductShellFrameProps) {
  return (
    <div {...rootAttributes} className={rootClassName} data-product-shell-frame>
      {header}
      <div className={mainClassName}>
        <div className={contentClassName}>{children}</div>
      </div>
      {navigation}
      {overlays}
    </div>
  );
}
