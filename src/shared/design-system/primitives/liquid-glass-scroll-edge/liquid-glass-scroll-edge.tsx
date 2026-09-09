import '../../tokens/generated/hydro.semantic.module.scss';
import styles from './liquid-glass-scroll-edge.module.scss';

export type LiquidGlassScrollEdgeEdge = 'top' | 'bottom' | 'leading' | 'trailing';
export type LiquidGlassScrollEdgeTone = 'auto' | 'light' | 'dark';
export type LiquidGlassScrollEdgeVariant = 'blur' | 'solid' | 'mixed';
export type LiquidGlassScrollEdgeSize = 'sm' | 'md' | 'lg';

export type LiquidGlassScrollEdgeProps = {
  edge: LiquidGlassScrollEdgeEdge;
  tone?: LiquidGlassScrollEdgeTone;
  variant?: LiquidGlassScrollEdgeVariant;
  size?: LiquidGlassScrollEdgeSize;
  visible?: boolean;
  className?: string;
};

export function LiquidGlassScrollEdge({
  edge,
  tone = 'auto',
  variant = 'blur',
  size = 'md',
  visible = true,
  className = '',
}: LiquidGlassScrollEdgeProps) {
  if (!visible) {
    return null;
  }

  const showBlurLayers = variant === 'blur' || variant === 'mixed';
  const showSolidLayer = variant === 'solid' || variant === 'mixed';

  const classNames = [
    styles.scrollEdge,
    styles[`edge_${edge}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      data-edge={edge}
      data-tone={tone}
      data-variant={variant}
      data-size={size}
      aria-hidden
    >
      {showBlurLayers ? (
        <>
          <span className={styles.wrapper} aria-hidden />
          <span className={styles.gradientMask} aria-hidden />
          <span className={styles.blurLayer} aria-hidden />
        </>
      ) : null}
      {showSolidLayer ? <span className={styles.solidLayer} aria-hidden /> : null}
    </div>
  );
}
