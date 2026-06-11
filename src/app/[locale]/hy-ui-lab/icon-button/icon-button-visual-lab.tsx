'use client';

import { IconButton } from '@/shared/components/icon-button';

import { DepthProposalIconButton, type DepthProposalPressState } from './depth-proposal-icon-button';
import { GlassTestBackdrop } from './glass-test-backdrop';
import styles from './icon-button-visual-lab.module.sass';
import { ReferenceIconButton, type ReferenceIconButtonPressState } from './reference-icon-button';
import { SpectrumScrollGradient } from './spectrum-scroll-gradient';
import { useTransparencyScrollAlign } from './use-transparency-scroll-align';

type LabStateId = 'idle' | 'pressed' | 'release' | 'focus' | 'scroll';

type LabStateRow = {
  id: LabStateId;
  label: string;
  press?: ReferenceIconButtonPressState;
  focusVisible?: boolean;
};

const LAB_STATES: LabStateRow[] = [
  { id: 'idle', label: 'Idle' },
  { id: 'pressed', label: 'Pressed', press: 'pressed' },
  { id: 'release', label: 'Release', press: 'release' },
  { id: 'focus', label: 'Focus', focusVisible: true },
  { id: 'scroll', label: 'Scroll background', press: 'idle' },
];

type CargoFacsimileStatus = 'quotation' | 'transit' | 'operating' | 'completed';

type CargoFacsimileItem = {
  id: string;
  route: string;
  status: CargoFacsimileStatus;
  statusLabel: string;
};

const SCROLL_CARGO_ITEMS: CargoFacsimileItem[] = [
  { id: 'cargo-a', route: 'Santos → Manaus', status: 'quotation', statusLabel: 'Cotação' },
  { id: 'cargo-b', route: 'Paranaguá → Asunción', status: 'transit', statusLabel: 'Em trânsito' },
  { id: 'cargo-c', route: 'Itajaí → Montevidéu', status: 'operating', statusLabel: 'Operando' },
  { id: 'cargo-d', route: 'Belém → Santarém', status: 'completed', statusLabel: 'Concluída' },
  { id: 'cargo-e', route: 'Rio Grande → Buenos Aires', status: 'quotation', statusLabel: 'Cotação' },
  { id: 'cargo-f', route: 'Vitória → Salvador', status: 'transit', statusLabel: 'Em trânsito' },
  { id: 'cargo-g', route: 'Fortaleza → Belém', status: 'operating', statusLabel: 'Operando' },
  { id: 'cargo-h', route: 'Recife → Natal', status: 'completed', statusLabel: 'Concluída' },
  { id: 'cargo-i', route: 'Manaus → Porto Velho', status: 'quotation', statusLabel: 'Cotação' },
  { id: 'cargo-j', route: 'Corumbá → Cáceres', status: 'transit', statusLabel: 'Em trânsito' },
];

function CargoFacsimileCard({
  item,
  glassProbe = false,
}: {
  item: CargoFacsimileItem;
  glassProbe?: boolean;
}) {
  return (
    <article
      className={[styles.cargoFacsimile, glassProbe ? styles.cargoFacsimileProbe : ''].filter(Boolean).join(' ')}
      data-cargo-facsimile={item.id}
      {...(glassProbe ? { 'data-ui-glass-probe': 'true' } : {})}
    >
      <div className={styles.cargoFacsimileHeader}>
        <div className={styles.cargoFacsimileIcon} aria-hidden>
          <svg viewBox="0 0 24 24" focusable="false">
            <path
              d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.85"
              strokeLinejoin="round"
            />
            <path d="M12 11.5v8.5M4 8.5l8 4.5 8-4.5" fill="none" stroke="currentColor" strokeWidth="1.85" />
          </svg>
        </div>
        <div className={styles.cargoFacsimileCopy}>
          <p className={styles.cargoFacsimileId}>HY-{item.id.slice(-1).toUpperCase()}0426</p>
          <p className={styles.cargoFacsimileRoute}>{item.route}</p>
        </div>
        <span className={styles.cargoFacsimileBadge} data-status={item.status}>
          {item.statusLabel}
        </span>
      </div>
      <div className={styles.cargoRouteLine} aria-hidden />
    </article>
  );
}

function ScrollCargoFlow() {
  return (
    <>
      <div className={styles.scrollSpacer} aria-hidden />
      {SCROLL_CARGO_ITEMS.slice(0, 2).map((item) => (
        <CargoFacsimileCard key={item.id} item={item} />
      ))}
      {SCROLL_CARGO_ITEMS.slice(2).map((item) => (
        <CargoFacsimileCard key={item.id} item={item} />
      ))}
      <div className={styles.scrollSpacer} aria-hidden />
    </>
  );
}

function ActualIconButtonSnapshot({
  stateId,
  press,
  focusVisible,
}: {
  stateId: LabStateId;
  press?: ReferenceIconButtonPressState;
  focusVisible?: boolean;
}) {
  const shared = {
    ariaLabel: `Produção — ${stateId}`,
    iconName: 'filter' as const,
    iconButtonRole: 'field' as const,
    tabIndex: focusVisible ? 0 : -1,
    ...(press ? { 'data-press': press } : {}),
    ...(focusVisible ? { 'data-lab-focus': 'true' } : {}),
  };

  return (
    <div
      className={[styles.snapshotHost, focusVisible ? styles.focusSnapshot : ''].filter(Boolean).join(' ')}
      data-testid={`actual-${stateId}`}
      data-ui-state={stateId}
    >
      <IconButton {...shared} />
    </div>
  );
}

function DepthProposalSnapshot({
  stateId,
  press,
  focusVisible,
}: {
  stateId: LabStateId;
  press?: DepthProposalPressState;
  focusVisible?: boolean;
}) {
  return (
    <div
      className={[styles.snapshotHost, focusVisible ? styles.focusSnapshot : ''].filter(Boolean).join(' ')}
      data-testid={`depth-proposal-${stateId}`}
      data-ui-state={stateId}
    >
      <DepthProposalIconButton
        ariaLabel={`Depth proposal — ${stateId}`}
        labPressState={press}
        labFocusVisible={focusVisible}
      />
    </div>
  );
}

function ReferenceIconButtonSnapshot({
  stateId,
  press,
  focusVisible,
}: {
  stateId: LabStateId;
  press?: ReferenceIconButtonPressState;
  focusVisible?: boolean;
}) {
  return (
    <div
      data-testid={`reference-${stateId}`}
      className={styles.snapshotHost}
      data-ui-state={stateId}
    >
      <ReferenceIconButton
        ariaLabel={`Referência DevTools — ${stateId}`}
        labPressState={press}
        labFocusVisible={focusVisible}
      />
    </div>
  );
}

function StateGlassStage({
  stateId,
  press,
  focusVisible,
}: {
  stateId: LabStateId;
  press?: ReferenceIconButtonPressState;
  focusVisible?: boolean;
}) {
  return (
    <div className={styles.stateStage} data-testid={`state-glass-stage-${stateId}`}>
      <GlassTestBackdrop />
      <div className={styles.stateControls}>
        <ReferenceIconButtonSnapshot stateId={stateId} press={press} focusVisible={focusVisible} />
        <ActualIconButtonSnapshot stateId={stateId} press={press} focusVisible={focusVisible} />
        <DepthProposalSnapshot
          stateId={stateId}
          press={press as DepthProposalPressState | undefined}
          focusVisible={focusVisible}
        />
      </div>
    </div>
  );
}

function ScrollStage({ stateId }: { stateId: LabStateId }) {
  return (
    <div className={styles.scrollStage} data-testid="scroll-stage">
      <div className={styles.scrollSurface} data-testid="scroll-stage-surface">
        <div className={styles.scrollFlow}>
          <div className={styles.scrollCanvasHost}>
            <GlassTestBackdrop scrollCanvas />
          </div>
          <ScrollCargoFlow />
        </div>
      </div>
      <div className={styles.scrollControls}>
        <ReferenceIconButtonSnapshot stateId={stateId} press="idle" />
        <ActualIconButtonSnapshot stateId={stateId} press="idle" />
        <DepthProposalSnapshot stateId={stateId} press="idle" />
      </div>
    </div>
  );
}

type TransparencyScrollProps = {
  press?: ReferenceIconButtonPressState;
  focusVisible?: boolean;
};

function resolveTransparencyUiState(
  press?: ReferenceIconButtonPressState,
  focusVisible?: boolean,
): 'idle' | 'pressed' | 'release' | 'focus' | 'scroll' {
  if (focusVisible) return 'focus';
  if (press === 'pressed') return 'pressed';
  if (press === 'release') return 'release';
  return 'idle';
}

function TransparencyScrollTest({ press, focusVisible }: TransparencyScrollProps) {
  const scrollSurfaceRef = useTransparencyScrollAlign();
  const uiState = resolveTransparencyUiState(press, focusVisible);

  const sharedActual = {
    ariaLabel: 'Produção — transparency scroll',
    iconName: 'filter' as const,
    iconButtonRole: 'field' as const,
    tabIndex: focusVisible ? 0 : -1,
    ...(press ? { 'data-press': press } : {}),
    ...(focusVisible ? { 'data-lab-focus': 'true' } : {}),
  };

  return (
    <section
      className={styles.transparencySection}
      data-ui-section="transparency-scroll"
      data-testid="transparency-scroll-section"
      data-ui-state={uiState}
    >
      <h2 className={styles.transparencyTitle}>Transparency Scroll Test</h2>
      <p className={styles.transparencyHint}>
        Faixas amarelo, verde, azul, branco, preto, vermelho e rosa (100vh cada) rolam por trás dos três botões
        fixos no centro — role para ver as cores passando por baixo do vidro.
      </p>

      <div className={styles.transparencyLegend}>
        <span>Referência DevTools</span>
        <span>Produção atual</span>
        <span>Depth proposal</span>
      </div>
      <p className={styles.transparencyParityHint}>
        Alvo: fundo colorido visível atrás do botão, profundidade interna comparável ao container glass do BottomMenu.
      </p>

      <p className={styles.transparencyScrollHint}>Role dentro da área — os botões permanecem fixos no centro.</p>

      <div className={styles.transparencyStage} data-testid="transparency-scroll-stage">
        <div
          ref={scrollSurfaceRef}
          className={styles.transparencyScrollSurface}
          data-ui-scroll-viewport
          data-ui-scroll-surface
          data-testid="transparency-scroll-surface"
        >
          <div className={styles.transparencyContent} data-ui-scroll-content>
            <SpectrumScrollGradient />
          </div>
        </div>

        <div className={styles.transparencyStickyRail} data-ui-scroll-sticky-rail aria-hidden={false}>
          <div
            className={[styles.transparencyButtonHost, focusVisible ? styles.focusSnapshot : '']
              .filter(Boolean)
              .join(' ')}
            data-ui-reference-scroll-button
            data-testid="transparency-scroll-reference"
            data-ui-state={uiState}
          >
            <ReferenceIconButton
              ariaLabel="Referência DevTools — transparency scroll"
              labPressState={press}
              labFocusVisible={focusVisible}
            />
          </div>
          <div
            className={[styles.transparencyButtonHost, focusVisible ? styles.focusSnapshot : ''].filter(Boolean).join(' ')}
            data-ui-actual-scroll-button
            data-testid="transparency-scroll-actual"
            data-ui-state={uiState}
          >
            <IconButton {...sharedActual} />
          </div>
          <div
            className={[styles.transparencyButtonHost, focusVisible ? styles.focusSnapshot : ''].filter(Boolean).join(' ')}
            data-ui-depth-proposal-button
            data-testid="transparency-scroll-depth-proposal"
            data-ui-state={uiState}
          >
            <DepthProposalIconButton
              ariaLabel="Depth proposal — transparency scroll"
              labPressState={press as DepthProposalPressState | undefined}
              labFocusVisible={focusVisible}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function IconButtonVisualLab() {
  return (
    <main className={styles.root} data-icon-button-visual-lab="true" data-theme="light">
      <header className={styles.header}>
        <p className={styles.eyebrow}>HY UI Lab</p>
        <h1 className={styles.title}>IconButton Visual Gate</h1>
        <p className={styles.subtitle}>
          Referência DevTools literal (76px), produção aprovada glass-compact-production (~52px) e depth-proposal
          lab para comparação. Role o gradiente amarelo → rosa para validar transparência.
        </p>
      </header>

      <div className={styles.legend}>
        <span className={styles.legendReference}>Referência DevTools</span>
        <span className={styles.legendActual}>Produção atual</span>
        <span className={styles.legendDepthProposal}>Depth proposal</span>
      </div>

      <div className={styles.matrix}>
        {LAB_STATES.map((state) => (
          <section key={state.id} className={styles.row} data-testid={`lab-row-${state.id}`} data-lab-state={state.id}>
            <h2 className={styles.rowLabel}>{state.label}</h2>
            {state.id === 'scroll' ? (
              <ScrollStage stateId={state.id} />
            ) : (
              <StateGlassStage
                stateId={state.id}
                press={state.press}
                focusVisible={state.focusVisible}
              />
            )}
          </section>
        ))}
      </div>

      <TransparencyScrollTest />
    </main>
  );
}
