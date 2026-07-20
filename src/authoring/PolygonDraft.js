function round(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Tracks the points of a polygon while it's being drawn. All points
 * must land on the same scene — that's the scene the polygon belongs to.
 */
export class PolygonDraft {
  #sceneIndex = null;
  #points = [];

  get sceneIndex() {
    return this.#sceneIndex;
  }

  get points() {
    return this.#points;
  }

  get isValid() {
    return this.#points.length >= 3;
  }

  /** Returns false (and adds nothing) if the point belongs to a different scene. */
  addPoint(sceneIndex, x, y) {
    if (this.#sceneIndex === null) {
      this.#sceneIndex = sceneIndex;
    } else if (sceneIndex !== this.#sceneIndex) {
      return false;
    }

    this.#points.push([round(x), round(y)]);
    return true;
  }

  undoLastPoint() {
    this.#points.pop();
    if (this.#points.length === 0) {
      this.#sceneIndex = null;
    }
  }

  reset() {
    this.#sceneIndex = null;
    this.#points = [];
  }
}
