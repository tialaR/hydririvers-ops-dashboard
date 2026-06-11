import styles from './glass-test-backdrop.module.sass';

type GlassTestBackdropProps = {
  className?: string;
  /** Tall in-flow canvas for transparency scroll — same shell as /cargas mobile light. */
  scrollCanvas?: boolean;
};

/**
 * Hydri mobile light shell canvas — paridade com `mobile-product-v2-light-page-background`
 * + `mobile-product-v2-light-canvas-depth`. Lab-only.
 */
export function GlassTestBackdrop({ className, scrollCanvas = false }: GlassTestBackdropProps) {
  if (scrollCanvas) {
    return (
      <div
        className={[styles.scrollCanvas, className].filter(Boolean).join(' ')}
        data-ui-glass-backdrop="true"
        aria-hidden
      >
        <div className={styles.riverRoutes}>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={`route-${index}`} className={styles.riverRoute} data-route={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-ui-glass-backdrop="true"
      aria-hidden
    />
  );
}
