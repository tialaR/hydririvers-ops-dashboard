'use client';

import type { AriaRole, ReactNode } from 'react';
import { InformationalCard as CoreInformationalCard } from '@/shared/design-system/core/informational-card';
import styles from './InformationalCard.module.scss';

export type InformationalCardTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type InformationalCardAlign = 'center' | 'start';
type InformationalCardDataAttributes = Record<string, string | number | boolean | undefined>;

export type InformationalCardProps = {
  icon?: ReactNode; title: string; description?: string; action?: ReactNode;
  align?: InformationalCardAlign; tone?: InformationalCardTone; className?: string; role?: AriaRole;
  dataAttributes?: InformationalCardDataAttributes; iconDataAttributes?: InformationalCardDataAttributes;
  titleDataAttributes?: InformationalCardDataAttributes; descriptionDataAttributes?: InformationalCardDataAttributes;
  children?: ReactNode;
};

export function InformationalCard({
  icon, title, description, action, align = 'center', tone = 'info', className = '', role = 'status',
  dataAttributes, iconDataAttributes, titleDataAttributes, descriptionDataAttributes, children,
}: InformationalCardProps) {
  return (
    <CoreInformationalCard
      icon={icon}
      title={title}
      description={description}
      action={action}
      role={role}
      className={className}
      slots={{
        rootClassName: [styles.card, styles[`align_${align}`], styles[`tone_${tone}`]].filter(Boolean).join(' '),
        iconClassName: styles.icon,
        titleClassName: styles.title,
        descriptionClassName: styles.description,
        actionClassName: styles.action,
      }}
      rootProps={{ ...dataAttributes, 'data-informational-card': 'true', 'data-informational-card-tone': tone, 'data-informational-card-align': align }}
      iconProps={{ ...iconDataAttributes, 'data-informational-card-icon': 'true' }}
      titleProps={{ ...titleDataAttributes, 'data-informational-card-title': 'true' }}
      descriptionProps={{ ...descriptionDataAttributes, 'data-informational-card-description': 'true' }}
    >
      {children}
    </CoreInformationalCard>
  );
}
