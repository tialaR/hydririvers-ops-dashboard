import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const target = 'src/features/dashboard/components/operations-board/operations-board.module.scss';

const start = '/* HYDRIRIVERS_OVERVIEW_FINE_TUNE_START */';
const end = '/* HYDRIRIVERS_OVERVIEW_FINE_TUNE_END */';

if (!existsSync(target)) {
  console.error(`Arquivo não encontrado: ${target}`);
  process.exit(1);
}

const patch = `
${start}

/* Ajustes finos solicitados no print: somente visão geral */

/* padding horizontal mínimo no container */
.overviewPanel {
  padding-inline: 6px;
}

/* Vermelho: reduzir operação, operador e pill do trajeto */
.metaGrid {
  gap: 24px;
}

.metaItem span {
  gap: 7px;
  margin-bottom: 7px;
  font-size: 0.8rem;
  line-height: 1.32;
}

.metaItem strong {
  font-size: clamp(0.92rem, 0.84rem + 0.26vw, 1.04rem);
  font-weight: 720;
  line-height: 1.16;
}

.routeHead b {
  padding: 7px 13px;
  font-size: 0.8
  font-weight: 780;
  box-shadow: 0 0 20px rgba(47, 230, 216, 0.1);
}

/* Cards laterais: ícones mais imponentes e cores por categoria */
.sideCard {
  gap: 13px;
}

.sideIcon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
}

.sideIcon svg {
  width: 24px;
  height: 24px;
  stroke-width: 2.35;
}

.sideIconCyan {
  color: #2fe0d0;
  background: rgba(47, 224, 208, 0.13);
  border-color: rgba(47, 224, 208, 0.26);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 22px rgba(47, 224, 208, 0.1);
}

.sideIconBlue {
  color: #58a9ff;
  background: rgba(88, 169, 255, 0.15);
  border-color: rgba(88, 169, 255, 0.28);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 22px rgba(88, 169, 255, 0.1);
}

.sideIconGold {
  color: #f3c241;
  background: rgba(243, 194, 65, 0.15);
  border-color: rgba(243, 194, 65, 0.3);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 22px rgba(243, 194, 65, 0.12);
}

.sideIconGreen {
  color: #74f36b;
  background: rgba(116, 243, 17, 0.14);
  border-color: rgba(116, 243, 107, 0.28);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 22px rgba(116, 243, 107, 0.12);
}

/* Valores dos cards laterais */
.sideCard:nth-child(1) .sideCopy strong,
.sideCard:nth-child(2) .sideCopy strong {
  color: #f4fbff;
}

.sideCard:nth-child(3) .sideCopy strong {
  color: #ffffff;
  text-shadow: 0 0 18px rgba(243, 194, 65, 0.14);
}

.sideCard:nth-child(4) .sideCopy strong {
  color: #74f36b;
  text-shadow: 0 0 18px rgba(116, 243, 107, 0.2);
}

/* Badge "No horário" */
.sideCopy b {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border: 1px solid rgba(116, 243, 107, 0.28);
  border-radius: 999px;
  background: rgba(116, 243, 107, 0.12);
  color: #8dff79;
  font-size: 0.78rem;
  font-weight: 780;
  line-height: 1.2;
}

/* Barra de documentos */
.sideProgress i {
  background: linear-gradient(90deg, #4fd2ff 0%, #6b94ff 100%);
  box-shadow: 0 0 16px rgba(82, 207, 255, 0.36);
}

* Mini gráficos laterais */
.miniChart {
  color: #f3c241;
  opacity: 0.98;
}

.miniChart path {
  stroke-width: 4.6;
}

.miniChartGreen {
  color: #74f36b;
}

/* Lilás: cores dos KPIs inferiores como na referência */
.metricStrip .metricCard:nth-child(1) strong {
  color: #2fe0d0;
}

.metricCard .metricValueBlue {
  color: #58a9ff;
}

.metricCard .metricValueCyan {
  color: #31d7d1;
}

.metricCard .metricValueGreen {
  color: #74f36b;
}

.metricCard strong svg {
  stroke-width: 2.25;
  filter: drop-shadow(0 0 10px currentColor);
}

${end}
`;

const current = readFileSync(target, 'utf8');

const blockRegex = new RegExp(
  `${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
  'm'
);

const next = blockRegex.test(current)
  ? current.replace(blockRegex, patch.trim())
  : `${current.trimEnd()}\n\n${patch.trim()}\n`;

writeFileSync(target, next);

console.log(`Fine tune aplicado em ${target}`);
