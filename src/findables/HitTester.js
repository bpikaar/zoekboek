import { isPointInPolygon, distanceToPolygon } from '../geometry/pointInPolygon.js';

/**
 * Answers "did the visitor click a findable object?" for a given scene
 * and a point expressed as scene-relative percentages (0-100).
 *
 * Optionally forgiving: if nothing was hit exactly but a polygon's
 * boundary is within `tolerancePx` physical pixels of the point, that
 * nearest one counts too — fingers are far less precise than a mouse
 * cursor, and several findable objects in this app are only a few
 * percent of the image wide.
 */
export class HitTester {
  #repository;

  constructor(repository) {
    this.#repository = repository;
  }

  /**
   * @param {{ tolerancePx?: number, scale?: { x: number, y: number } }} [options]
   */
  test(sceneIndex, x, y, { tolerancePx = 0, scale = { x: 1, y: 1 } } = {}) {
    const candidates = this.#repository.getScene(sceneIndex);

    const exact = candidates.find((findable) => isPointInPolygon([x, y], findable.polygon));
    if (exact || tolerancePx <= 0) return exact ?? null;

    let nearest = null;
    let nearestDistance = tolerancePx;
    for (const findable of candidates) {
      const distance = distanceToPolygon([x, y], findable.polygon, scale);
      if (distance <= nearestDistance) {
        nearest = findable;
        nearestDistance = distance;
      }
    }

    return nearest;
  }
}
