/**
 * Ray-casting point-in-polygon test (even-odd rule). Works in any
 * consistent unit as long as `point` and `polygon` use the same one —
 * this app uses percentages (0-100) relative to a scene's image.
 *
 * @param {[number, number]} point
 * @param {Array<[number, number]>} polygon
 */
export function isPointInPolygon([px, py], polygon) {
  let isInside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const crossesRay = yi > py !== yj > py;
    if (!crossesRay) continue;

    const intersectionX = ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (px < intersectionX) {
      isInside = !isInside;
    }
  }

  return isInside;
}

function distanceToSegment([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy;

  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared));
  const closestX = ax + t * dx;
  const closestY = ay + t * dy;

  return Math.hypot(px - closestX, py - closestY);
}

/**
 * Shortest distance from `point` to a polygon's boundary — 0 if the point
 * is inside it. `scale` converts each axis into a common physical unit
 * before measuring, since `point`/`polygon` are in percentages relative to
 * two differently-sized axes (scene width vs. height); pass e.g. pixels
 * per percent so the result is a true physical-pixel distance, which is
 * what a "how close was this tap" tolerance check actually needs.
 *
 * @param {[number, number]} point
 * @param {Array<[number, number]>} polygon
 * @param {{ x: number, y: number }} [scale]
 */
export function distanceToPolygon(point, polygon, scale = { x: 1, y: 1 }) {
  if (isPointInPolygon(point, polygon)) return 0;

  const toScaled = ([x, y]) => [x * scale.x, y * scale.y];
  const scaledPoint = toScaled(point);

  let minDistance = Infinity;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const distance = distanceToSegment(scaledPoint, toScaled(polygon[j]), toScaled(polygon[i]));
    if (distance < minDistance) minDistance = distance;
  }

  return minDistance;
}
