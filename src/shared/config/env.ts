/**
 * Políticas derivadas de variáveis de ambiente (mock, QA hub, logs).
 */

/** Alinhado a `POST /api/mock-mode`: só `HYDRORIVERS_ALLOW_MOCK_MODE_RESET === 'true'` permite reset. */
export function isMockModeResetAllowed(): boolean {
  return process.env.HYDRORIVERS_ALLOW_MOCK_MODE_RESET === 'true';
}

export function isOtpCodeExposed(): boolean {
  if (process.env.HYDRORIVERS_EXPOSE_OTP_CODE === 'false') return false;
  if (process.env.HYDRORIVERS_EXPOSE_OTP_CODE === 'true') return true;
  return process.env.NODE_ENV !== 'production';
}

export function isMockQaHubEnabled(): boolean {
  if (process.env.HYDRORIVERS_FORCE_MOCK_QA_UI === 'true') return true;
  return process.env.NODE_ENV !== 'production';
}

export function isUseCaseLogsEnabled(): boolean {
  return process.env.HYDRORIVERS_USE_CASE_LOGS === 'true';
}

export function isDevScenarioLogsEnabled(): boolean {
  return process.env.HYDRORIVERS_DEV_SCENARIO_LOGS === 'true';
}

export function isDevScenarioVerboseEnabled(): boolean {
  return process.env.HYDRORIVERS_DEV_SCENARIO_VERBOSE === 'true';
}

/** `POST /api/auth/qa-direct-login` permitido neste runtime. */
export function isQaDirectLoginAllowed(): boolean {
  if (process.env.HYDRORIVERS_FORCE_QA_DIRECT_LOGIN === 'true') return true;
  if (process.env.NODE_ENV === 'production') return false;
  return process.env.HYDRORIVERS_ALLOW_QA_DIRECT_LOGIN !== 'false';
}

/** `POST /api/mock-mode/login-as` permitido neste runtime. */
export function isMockModeLoginAsAllowed(): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  return process.env.HYDRORIVERS_FORCE_QA_DIRECT_LOGIN === 'true';
}

/**
 * Rota dev isolada `/<locale>/dev/hydroway-map-spike` (spike MapLibre V2.1b–c).
 * Default: habilitada fora de production; em production só com flag explícita.
 */
export function isHydrowayMapLibreSpikeRouteEnabled(): boolean {
  if (process.env.HYDRORIVERS_HYDROWAY_MAP_SPIKE_ROUTE === 'true') return true;
  if (process.env.HYDRORIVERS_HYDROWAY_MAP_SPIKE_ROUTE === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}

/**
 * Rota dev isolada `/<locale>/dev/mobile-cargo-list-lab` (lista mobile Apple-inspired).
 * Default: habilitada fora de production; em production só com flag explícita.
 */
export function isMobileCargoListLabRouteEnabled(): boolean {
  if (process.env.HYDRORIVERS_MOBILE_CARGO_LIST_LAB_ROUTE === 'true') return true;
  if (process.env.HYDRORIVERS_MOBILE_CARGO_LIST_LAB_ROUTE === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}
