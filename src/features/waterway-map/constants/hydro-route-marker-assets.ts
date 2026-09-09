import { HYDRI_CARGO_BOAT_MARKER_SVG_URL } from './hydro-cargo-boat-marker';

/** Public URLs for animated route identification markers (MapLibre HTML markers). */
export const HYDRIRIVERS_CURRENT_CARGO_SVG_URL = HYDRI_CARGO_BOAT_MARKER_SVG_URL;

export const HYDRIRIVERS_ORIGIN_RADAR_SVG_URL =
  '/assets/map/hydririvers-radar-dot-cyan-transparent-pulsing.svg';

export const HYDRIRIVERS_DESTINATION_RADAR_SVG_URL =
  '/assets/map/hydririvers-radar-dot-amber-transparent-pulsing.svg';

/** @deprecated Prefer `HYDRIRIVERS_ORIGIN_RADAR_SVG_URL`. */
export const HYDRI_ROUTE_ORIGIN_MARKER_SVG_URL = HYDRIRIVERS_ORIGIN_RADAR_SVG_URL;

/** @deprecated Prefer `HYDRIRIVERS_DESTINATION_RADAR_SVG_URL`. */
export const HYDRI_ROUTE_DESTINATION_MARKER_SVG_URL = HYDRIRIVERS_DESTINATION_RADAR_SVG_URL;

/** @deprecated Prefer `HYDRIRIVERS_CURRENT_CARGO_SVG_URL`. */
export const HYDRI_ROUTE_VESSEL_MARKER_SVG_URL = HYDRIRIVERS_CURRENT_CARGO_SVG_URL;
