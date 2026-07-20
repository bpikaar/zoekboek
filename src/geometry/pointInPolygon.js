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
