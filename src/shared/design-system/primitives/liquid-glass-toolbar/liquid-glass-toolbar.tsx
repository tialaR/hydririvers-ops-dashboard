import type { ReactNode } from 'react';

import '../../tokens/generated/hydro.semantic.module.scss';
import {
  LiquidGlassButton,
  type LiquidGlassButtonFill,
  type LiquidGlassButtonTone,
} from '../liquid-glass-button';
import styles from './liquid-glass-toolbar.module.scss';

export type LiquidGlassToolbarVariant =
  | 'default'
  | 'twoLine'
  | 'twoLineLeft'
  | 'largeTitle'
  | 'compactLarge';

export type LiquidGlassToolbarContext = 'page' | 'sheet';
export type LiquidGlassToolbarTone = 'auto' | 'light' | 'dark';

export type LiquidGlassToolbarActionTone = 'neutral' | 'accent' | 'destructive';

export type LiquidGlassToolbarAction = {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  tone?: LiquidGlassToolbarActionTone;
  disabled?: boolean;
};

export type LiquidGlassToolbarProps = {
  title?: string;
  subtitle?: string;
  variant?: LiquidGlassToolbarVariant;
  context?: LiquidGlassToolbarContext;
  tone?: LiquidGlassToolbarTone;
  showGrabber?: boolean;
  leadingAction?: LiquidGlassToolbarAction;
  trailingAction?: LiquidGlassToolbarAction;
  trailingActions?: LiquidGlassToolbarAction[];
  className?: string;
  titleClassName?: string;
};

function resolveTrailingActions(
  trailingAction: LiquidGlassToolbarAction | undefined,
  trailingActions: LiquidGlassToolbarAction[] | undefined,
): LiquidGlassToolbarAction[] {
  if (trailingActions != null && trailingActions.length > 0) {
    return trailingActions;
  }

  if (trailingAction != null) {
    return [trailingAction];
  }

  return [];
}

function resolveActionFill(
  actionTone: LiquidGlassToolbarActionTone,
  context: LiquidGlassToolbarContext,
): LiquidGlassButtonFill {
  if (actionTone === 'accent' || actionTone === 'destructive') {
    return 'filled';
  }

  return context === 'sheet' ? 'tinted' : 'glass';
}

function mapActionTone(tone: LiquidGlassToolbarActionTone): LiquidGlassButtonTone {
  if (tone === 'accent') {
    return 'accent';
  }

  if (tone === 'destructive') {
    return 'destructive';
  }

  return 'neutral';
}

type ToolbarActionButtonProps = {
  action: LiquidGlassToolbarAction;
  context: LiquidGlassToolbarContext;
  tone: LiquidGlassToolbarTone;
};

function ToolbarActionButton({ action, context, tone }: ToolbarActionButtonProps) {
  const actionTone = action.tone ?? 'neutral';

  return (
    <LiquidGlassButton
      variant="icon"
      size="md"
      tone={mapActionTone(actionTone)}
      fill={resolveActionFill(actionTone, context)}
      themeTone={tone}
      aria-label={action.label}
      disabled={action.disabled}
      onClick={action.onClick}
      icon={action.icon}
      className={styles.actionButton}
    />
  );
}

function LeadingSlot({
  action,
  context,
  tone,
}: {
  action: LiquidGlassToolbarAction | undefined;
  context: LiquidGlassToolbarContext;
  tone: LiquidGlassToolbarTone;
}) {
  if (action == null) {
    return <span className={styles.leadingSpacer} aria-hidden />;
  }

  return (
    <div className={styles.leading}>
      <ToolbarActionButton action={action} context={context} tone={tone} />
    </div>
  );
}

function TrailingSlot({
  actions,
  context,
  tone,
}: {
  actions: LiquidGlassToolbarAction[];
  context: LiquidGlassToolbarContext;
  tone: LiquidGlassToolbarTone;
}) {
  if (actions.length === 0) {
    return <span className={styles.trailingSpacer} aria-hidden />;
  }

  return (
    <div className={styles.trailing}>
      {actions.map((action, index) => (
        <ToolbarActionButton
          key={`${action.label}-${index}`}
          action={action}
          context={context}
          tone={tone}
        />
      ))}
    </div>
  );
}

function TitleBlock({
  title,
  subtitle,
  variant,
  titleClassName = '',
}: {
  title?: string;
  subtitle?: string;
  variant: LiquidGlassToolbarVariant;
  titleClassName?: string;
}) {
  const hasTitle = title != null && title.trim() !== '';
  const hasSubtitle = subtitle != null && subtitle.trim() !== '';

  if (!hasTitle && !hasSubtitle) {
    return null;
  }

  const titleClasses = [styles.title, titleClassName].filter(Boolean).join(' ');

  return (
    <div className={styles.titleBlock} data-title-layout={variant}>
      {hasTitle ? <p className={titleClasses}>{title}</p> : null}
      {hasSubtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
    </div>
  );
}

/**
 * Mobile toolbar primitive (Figma Toolbar — Top — iPhone / Sheet).
 *
 * Standalone header for page or sheet contexts. Does not replace existing
 * app toolbars; compose in mobile lab flows when ready.
 */
export function LiquidGlassToolbar({
  title,
  subtitle,
  variant = 'default',
  context = 'page',
  tone = 'auto',
  showGrabber,
  leadingAction,
  trailingAction,
  trailingActions,
  className = '',
  titleClassName = '',
}: LiquidGlassToolbarProps) {
  const resolvedShowGrabber = showGrabber ?? context === 'sheet';
  const trailing = resolveTrailingActions(trailingAction, trailingActions);

  const toolbarClassName = [
    styles.toolbar,
    styles[`variant_${variant}`],
    styles[`context_${context}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const grabber = resolvedShowGrabber ? (
    <div className={styles.grabberWrap}>
      <div className={styles.grabber} aria-hidden />
    </div>
  ) : null;

  const titleBlock = (
    <TitleBlock
      title={title}
      subtitle={subtitle}
      variant={variant}
      titleClassName={titleClassName}
    />
  );

  if (variant === 'largeTitle') {
    return (
      <header
        className={toolbarClassName}
        data-variant={variant}
        data-context={context}
        data-tone={tone}
      >
        {grabber}
        <div className={styles.controls}>
          <LeadingSlot action={leadingAction} context={context} tone={tone} />
          <span className={styles.controlsSpacer} aria-hidden />
          <TrailingSlot actions={trailing} context={context} tone={tone} />
        </div>
        {titleBlock}
      </header>
    );
  }

  if (variant === 'compactLarge') {
    return (
      <header
        className={toolbarClassName}
        data-variant={variant}
        data-context={context}
        data-tone={tone}
      >
        {grabber}
        <div className={`${styles.controls} ${styles.controls_compactLarge}`}>
          {titleBlock}
          <TrailingSlot actions={trailing} context={context} tone={tone} />
        </div>
      </header>
    );
  }

  if (variant === 'twoLine') {
    return (
      <header
        className={toolbarClassName}
        data-variant={variant}
        data-context={context}
        data-tone={tone}
      >
        {grabber}
        <div className={`${styles.controls} ${styles.controls_twoLine}`}>
          <LeadingSlot action={leadingAction} context={context} tone={tone} />
          <span className={styles.controlsSpacer} aria-hidden />
          <TrailingSlot actions={trailing} context={context} tone={tone} />
          {titleBlock}
        </div>
      </header>
    );
  }

  if (variant === 'twoLineLeft') {
    return (
      <header
        className={toolbarClassName}
        data-variant={variant}
        data-context={context}
        data-tone={tone}
      >
        {grabber}
        <div className={styles.controls}>
          <LeadingSlot action={leadingAction} context={context} tone={tone} />
          {titleBlock}
          <TrailingSlot actions={trailing} context={context} tone={tone} />
        </div>
      </header>
    );
  }

  return (
    <header
      className={toolbarClassName}
      data-variant={variant}
      data-context={context}
      data-tone={tone}
    >
      {grabber}
      <div className={styles.controls}>
        <LeadingSlot action={leadingAction} context={context} tone={tone} />
        <span className={styles.controlsSpacer} aria-hidden />
        <TrailingSlot actions={trailing} context={context} tone={tone} />
        {titleBlock}
      </div>
    </header>
  );
}
