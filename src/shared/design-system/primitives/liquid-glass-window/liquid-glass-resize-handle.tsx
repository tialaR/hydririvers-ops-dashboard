import '../../tokens/generated/hydro.semantic.module.scss';
import styles from './liquid-glass-window.module.scss';

export type LiquidGlassResizeHandleProps = {
  visible?: boolean;
  className?: string;
};

export function LiquidGlassResizeHandle({
  visible = true,
  className = '',
}: LiquidGlassResizeHandleProps) {
  const classNames = [styles.resizeHandle, className].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      data-visible={visible ? 'true' : 'false'}
      aria-hidden
    >
      <span className={styles.resizeGrabber} />
    </div>
  );
}
