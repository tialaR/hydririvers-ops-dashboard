import type { AriaRole, HTMLAttributes, ReactNode } from 'react';

type DataAttributes = {
  [key: `data-${string}`]: string | number | boolean | undefined;
};

export type InformationalCardSlots = {
  rootClassName?: string;
  iconClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionClassName?: string;
};

export type InformationalCardProps = {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  role?: AriaRole;
  className?: string;
  slots?: InformationalCardSlots;
  rootProps?: HTMLAttributes<HTMLDivElement> & DataAttributes;
  iconProps?: HTMLAttributes<HTMLSpanElement> & DataAttributes;
  titleProps?: HTMLAttributes<HTMLHeadingElement> & DataAttributes;
  descriptionProps?: HTMLAttributes<HTMLParagraphElement> & DataAttributes;
};

export function InformationalCard({
  icon,
  title,
  description,
  action,
  children,
  role = 'status',
  className = '',
  slots = {},
  rootProps,
  iconProps,
  titleProps,
  descriptionProps,
}: InformationalCardProps) {
  return (
    <div {...rootProps} role={role} className={[slots.rootClassName, className].filter(Boolean).join(' ')}>
      {icon ? (
        <span {...iconProps} className={slots.iconClassName} aria-hidden={iconProps?.['aria-hidden'] ?? true}>
          {icon}
        </span>
      ) : null}
      <h3 {...titleProps} className={slots.titleClassName}>{title}</h3>
      {description ? (
        <p {...descriptionProps} className={slots.descriptionClassName}>{description}</p>
      ) : null}
      {children}
      {action ? <div className={slots.actionClassName}>{action}</div> : null}
    </div>
  );
}
