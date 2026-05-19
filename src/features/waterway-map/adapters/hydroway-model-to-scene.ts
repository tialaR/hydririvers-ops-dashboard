import type { HydrowayGeoFeature } from '../domain/hydroway-geo.types';
import type { HydrowayMapModel } from '../domain/hydroway-map-model.types';
import type { HydrowayMapScene, HydrowayMapViewBox } from '../providers/map-provider.types';
import { HYDRO_MAP_VIEWBOX } from '../utils/hydro-map-style';
import {
  extractLineStringCoordinates,
  extractPointCoordinate,
  lineStringToSvgPathD,
  lngLatToSchematicPoint,
} from '../utils/geo-to-schematic';

/** Converte HydrowayMapModel (V2.2b) em cena schematic para o provider SVG. */
export function hydrowayModelToScene(
  model: HydrowayMapModel,
  viewBox: HydrowayMapViewBox = HYDRO_MAP_VIEWBOX,
): HydrowayMapScene {
  const corridors = model.geo.mainRivers.features
    .filter(
      (feature): feature is HydrowayGeoFeature & { geometry: GeoJSON.LineString } =>
        feature.geometry.type === 'LineString',
    )
    .map((feature) => {
      const coordinates = feature.geometry.coordinates;
      const mid = coordinates[Math.floor(coordinates.length / 2)] ?? coordinates[0] ?? [0, 0];
      const properties = feature.properties;
      return {
        id: properties?.id ?? 'river',
        label: properties?.name ?? properties?.id ?? 'Rio',
        labelPoint: lngLatToSchematicPoint(mid, viewBox),
        pathD: lineStringToSvgPathD(coordinates, viewBox),
      };
    });

  const cities = model.geo.portsTerminals.features
    .filter(
      (feature): feature is HydrowayGeoFeature & { geometry: GeoJSON.Point } =>
        feature.geometry.type === 'Point',
    )
    .map((feature) => {
      const properties = feature.properties;
      return {
        id: properties?.id ?? 'port',
        name: properties?.name ?? 'Porto',
        point: lngLatToSchematicPoint(feature.geometry.coordinates, viewBox),
      };
    });

  const routeTrack = extractLineStringCoordinates(model.geo.routeTrack);
  const routeTraveled = extractLineStringCoordinates(model.geo.routeTraveled);
  const originCoord = extractPointCoordinate(model.geo.origin) ?? routeTrack[0] ?? [0, 0];
  const destinationCoord =
    extractPointCoordinate(model.geo.destination) ?? routeTrack[routeTrack.length - 1] ?? [0, 0];
  const vesselCoord = extractPointCoordinate(model.geo.vessel) ?? originCoord;

  return {
    corridors,
    cities,
    route: {
      cargoId: model.cargoId,
      corridorId: model.corridorId,
      originLabel: model.metadata.originLabel,
      destinationLabel: model.metadata.destinationLabel,
      origin: lngLatToSchematicPoint(originCoord, viewBox),
      destination: lngLatToSchematicPoint(destinationCoord, viewBox),
      routePathD: lineStringToSvgPathD(routeTrack, viewBox),
      traveledPathD: lineStringToSvgPathD(routeTraveled, viewBox),
      vessel: lngLatToSchematicPoint(vesselCoord, viewBox),
      progress01: model.progress01,
    },
  };
}
