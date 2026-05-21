import {
  DESKTOP_MAP_VIEWBOX,
  type DesktopExpandedRouteGeometry,
  type DesktopMapPoint,
} from './desktop-cargo-map.helpers';

export type DesktopMapCamera = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const DESKTOP_MAP_INITIAL_CAMERA: DesktopMapCamera = {
  x: 0,
  y: 0,
  width: DESKTOP_MAP_VIEWBOX.width,
  height: DESKTOP_MAP_VIEWBOX.height,
};

const CAMERA_ASPECT = DESKTOP_MAP_VIEWBOX.width / DESKTOP_MAP_VIEWBOX.height;
const MIN_CAMERA_WIDTH = 380;
const MIN_CAMERA_HEIGHT = MIN_CAMERA_WIDTH / CAMERA_ASPECT;
const FIT_ROUTE_MIN_WIDTH = 520;
const RECENTER_WIDTH = 560;
const ZOOM_STEP_FACTOR = 1.18;
const PAN_MARGIN_RATIO = 0.14;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeCameraSize(width: number, height: number) {
  let nextWidth = clamp(width, MIN_CAMERA_WIDTH, DESKTOP_MAP_VIEWBOX.width);
  let nextHeight = clamp(height, MIN_CAMERA_HEIGHT, DESKTOP_MAP_VIEWBOX.height);

  if (Math.abs(nextWidth / nextHeight - CAMERA_ASPECT) > 0.001) {
    nextHeight = nextWidth / CAMERA_ASPECT;
    if (nextHeight > DESKTOP_MAP_VIEWBOX.height) {
      nextHeight = DESKTOP_MAP_VIEWBOX.height;
      nextWidth = nextHeight * CAMERA_ASPECT;
    }
  }

  return { width: nextWidth, height: nextHeight };
}

export function clampDesktopMapCamera(camera: DesktopMapCamera): DesktopMapCamera {
  const { width, height } = normalizeCameraSize(camera.width, camera.height);
  const marginX = width * PAN_MARGIN_RATIO;
  const marginY = height * PAN_MARGIN_RATIO;

  let x = camera.x;
  let y = camera.y;

  if (width >= DESKTOP_MAP_VIEWBOX.width) {
    x = (DESKTOP_MAP_VIEWBOX.width - width) / 2;
  } else {
    x = clamp(x, -marginX, DESKTOP_MAP_VIEWBOX.width - width + marginX);
  }

  if (height >= DESKTOP_MAP_VIEWBOX.height) {
    y = (DESKTOP_MAP_VIEWBOX.height - height) / 2;
  } else {
    y = clamp(y, -marginY, DESKTOP_MAP_VIEWBOX.height - height + marginY);
  }

  return { x, y, width, height };
}

export function getDesktopMapZoomPercent(camera: DesktopMapCamera) {
  return Math.round((DESKTOP_MAP_INITIAL_CAMERA.height / camera.height) * 100);
}

export function getRouteBounds(geometry: DesktopExpandedRouteGeometry) {
  const points: DesktopMapPoint[] = [geometry.origin, geometry.destination, geometry.vessel];

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

function cameraAroundPoint(center: DesktopMapPoint, width: number) {
  const { width: normalizedWidth, height } = normalizeCameraSize(width, width / CAMERA_ASPECT);
  return clampDesktopMapCamera({
    x: center.x - normalizedWidth / 2,
    y: center.y - height / 2,
    width: normalizedWidth,
    height,
  });
}

export function createFitRouteCamera(geometry: DesktopExpandedRouteGeometry, padding = 140) {
  const bounds = getRouteBounds(geometry);
  const spanX = bounds.maxX - bounds.minX + padding * 2;
  const spanY = bounds.maxY - bounds.minY + padding * 2;
  const width = clamp(Math.max(spanX, spanY * CAMERA_ASPECT, FIT_ROUTE_MIN_WIDTH), MIN_CAMERA_WIDTH, DESKTOP_MAP_VIEWBOX.width);

  return cameraAroundPoint(
    {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
    },
    width,
  );
}

export function createRecenterVesselCamera(geometry: DesktopExpandedRouteGeometry) {
  return cameraAroundPoint(geometry.vessel, RECENTER_WIDTH);
}

export function createResetCamera() {
  return { ...DESKTOP_MAP_INITIAL_CAMERA };
}

export function zoomDesktopMapCamera(camera: DesktopMapCamera, factor: number) {
  const centerX = camera.x + camera.width / 2;
  const centerY = camera.y + camera.height / 2;
  const ratioX = (centerX - camera.x) / camera.width;
  const ratioY = (centerY - camera.y) / camera.height;
  const { width, height } = normalizeCameraSize(camera.width / factor, camera.height / factor);

  return clampDesktopMapCamera({
    x: centerX - ratioX * width,
    y: centerY - ratioY * height,
    width,
    height,
  });
}

export function panDesktopMapCamera(camera: DesktopMapCamera, deltaX: number, deltaY: number) {
  return clampDesktopMapCamera({
    ...camera,
    x: camera.x + deltaX,
    y: camera.y + deltaY,
  });
}

export function zoomDesktopMapCameraIn(camera: DesktopMapCamera) {
  return zoomDesktopMapCamera(camera, ZOOM_STEP_FACTOR);
}

export function zoomDesktopMapCameraOut(camera: DesktopMapCamera) {
  return zoomDesktopMapCamera(camera, 1 / ZOOM_STEP_FACTOR);
}

export function mapPointerDeltaToCamera(
  camera: DesktopMapCamera,
  viewportWidth: number,
  viewportHeight: number,
  deltaX: number,
  deltaY: number,
) {
  if (!viewportWidth || !viewportHeight) {
    return camera;
  }

  const unitsPerPixelX = camera.width / viewportWidth;
  const unitsPerPixelY = camera.height / viewportHeight;

  return panDesktopMapCamera(camera, -deltaX * unitsPerPixelX, -deltaY * unitsPerPixelY);
}
