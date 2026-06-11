import type { ReactNode } from 'react';

import styles from './transparency-scroll-panorama.module.sass';

const PANORAMA_SEGMENTS = ['blue', 'aqua', 'green', 'lilac'] as const;
const SPECTRUM_BANDS = ['yellow', 'green', 'black', 'gray', 'pink'] as const;

function PanoramaSegment({ segment }: { segment: (typeof PANORAMA_SEGMENTS)[number] }) {
  return (
    <div className={styles.segment} data-segment={segment} data-ui-panorama-segment={segment}>
      <div className={styles.diffuseOrb} data-orb="1" aria-hidden />
      <div className={styles.diffuseOrb} data-orb="2" aria-hidden />
      <div className={styles.diffuseOrb} data-orb="3" aria-hidden />
      <div className={styles.hydroLine} data-line="a" aria-hidden />
      <div className={styles.hydroLine} data-line="b" aria-hidden />
      <div className={styles.hydroLine} data-line="c" aria-hidden />
      <div className={styles.translucentPlate}>Hidrovia · {segment}</div>
    </div>
  );
}

function SpectrumScrollBands() {
  return (
    <>
      {SPECTRUM_BANDS.map((spectrum) => (
        <div
          key={spectrum}
          className={styles.spectrumBand}
          data-spectrum={spectrum}
          {...(spectrum === 'pink' ? { 'data-ui-gradient-probe': 'true' } : {})}
          aria-hidden
        />
      ))}
    </>
  );
}

type TransparencyScrollPanoramaProps = {
  cargoCards: ReactNode;
};

export function TransparencyScrollPanorama({ cargoCards }: TransparencyScrollPanoramaProps) {
  return (
    <div className={styles.panoramaRoot} data-ui-scroll-panorama="true">
      <div className={styles.scrollSpacer} data-scroll-spacer="top" aria-hidden />
      {PANORAMA_SEGMENTS.map((segment) => (
        <PanoramaSegment key={`panorama-${segment}`} segment={segment} />
      ))}
      {cargoCards}
      <div className={styles.contrastMarker} data-ui-scroll-contrast-marker="true" aria-hidden />
      <SpectrumScrollBands />
      <div className={styles.afterScrollTarget} data-ui-after-scroll-target="true">
        <p className={styles.targetLabel}>Alvo pós-scroll · verde + lilás</p>
      </div>
      <PanoramaSegment segment="aqua" />
      <PanoramaSegment segment="lilac" />
      <div className={styles.scrollSpacer} data-scroll-spacer="bottom" aria-hidden />
    </div>
  );
}
