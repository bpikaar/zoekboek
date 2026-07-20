import { isPointInPolygon } from '../geometry/pointInPolygon.js';

/**
 * Answers "did the visitor click a findable object?" for a given scene
 * and a point expressed as scene-relative percentages (0-100).
 */
export class HitTester {
  #repository;

  constructor(repository) {
    this.#repository = repository;
  }

  test(sceneIndex, x, y) {
    const candidates = this.#repository.getScene(sceneIndex);
    return candidates.find((findable) => isPointInPolygon([x, y], findable.polygon)) ?? null;
  }
}
