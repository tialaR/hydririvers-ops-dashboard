import styles from './spectrum-scroll-gradient.module.sass';

const SPECTRUM_BANDS = ['amarelo', 'verde', 'azul', 'branco', 'preto', 'vermelho', 'rosa'] as const;

type SpectrumBandId = (typeof SPECTRUM_BANDS)[number];

const BAND_LABELS: Record<SpectrumBandId, string> = {
  amarelo: 'Amarelo',
  verde: 'Verde',
  azul: 'Azul',
  branco: 'Branco',
  preto: 'Preto',
  vermelho: 'Vermelho',
  rosa: 'Rosa',
};

function SpectrumBand({
  band,
  glassProbe = false,
  afterScrollTarget = false,
}: {
  band: SpectrumBandId;
  glassProbe?: boolean;
  afterScrollTarget?: boolean;
}) {
  return (
    <div
      className={styles.band}
      data-spectrum-band={band}
      data-ui-panorama-segment={band}
      {...(glassProbe ? { 'data-ui-glass-probe': 'true' } : {})}
      {...(afterScrollTarget ? { 'data-ui-after-scroll-target': 'true' } : {})}
    >
      <p className={styles.bandLabel}>{BAND_LABELS[band]}</p>
      <div className={styles.bandOrb} data-orb="a" aria-hidden />
      <div className={styles.bandOrb} data-orb="b" aria-hidden />
      <div className={styles.bandHydroLine} aria-hidden />
    </div>
  );
}

/** Faixas amarelo → rosa em 100vh cada — conteúdo rola por baixo dos botões fixos. */
export function SpectrumScrollGradient() {
  return (
    <div className={styles.root} data-ui-spectrum-scroll-gradient="true">
      {SPECTRUM_BANDS.map((band) => (
        <SpectrumBand key={`cycle-a-${band}`} band={band} glassProbe={band === 'azul'} />
      ))}
      {SPECTRUM_BANDS.map((band) => (
        <SpectrumBand
          key={`cycle-b-${band}`}
          band={band}
          afterScrollTarget={band === 'rosa'}
        />
      ))}
    </div>
  );
}
