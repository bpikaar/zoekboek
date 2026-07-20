const SVG_NS = 'http://www.w3.org/2000/svg';

function toPointsAttr(points) {
  return points.map(([x, y]) => `${x},${y}`).join(' ');
}

/**
 * Draws findable-object polygons on top of a scene's image, using an SVG
 * with a `0 0 100 100` viewBox so points can be plotted directly in the
 * same percentage coordinates the polygons are stored in.
 *
 * Also used by the authoring tool to preview the polygon currently being
 * drawn (`setDraft`), before it has been saved as a findable.
 */
export class PolygonOverlay {
  #svg;
  #polygonElements = new Map();
  #draftPolyline = null;
  #draftPointElements = [];

  constructor(svgElement) {
    this.#svg = svgElement;
  }

  setEditable(isEditable) {
    this.#svg.classList.toggle('strip__hitlayer--editable', isEditable);
  }

  setPolygons(findables) {
    this.clear();
    findables.forEach((findable) => this.#addPolygon(findable));
  }

  #addPolygon(findable) {
    const polygon = document.createElementNS(SVG_NS, 'polygon');
    polygon.setAttribute('points', toPointsAttr(findable.polygon));
    polygon.dataset.id = findable.id;
    polygon.classList.add('hitlayer__polygon');
    this.#svg.appendChild(polygon);
    this.#polygonElements.set(findable.id, polygon);
  }

  /** @param {'correct' | 'wrong'} variant */
  flash(id, variant) {
    const polygon = this.#polygonElements.get(id);
    if (!polygon) return;

    polygon.classList.remove('hitlayer__polygon--flash-correct', 'hitlayer__polygon--flash-wrong');
    void polygon.getBoundingClientRect();
    polygon.classList.add(`hitlayer__polygon--flash-${variant}`);
  }

  setDraft(points) {
    this.clearDraft();
    if (points.length === 0) return;

    if (points.length > 1) {
      this.#draftPolyline = document.createElementNS(SVG_NS, 'polyline');
      this.#draftPolyline.setAttribute('points', toPointsAttr(points));
      this.#draftPolyline.classList.add('hitlayer__draft-line');
      this.#svg.appendChild(this.#draftPolyline);
    }

    this.#draftPointElements = points.map(([x, y]) => {
      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('cx', String(x));
      circle.setAttribute('cy', String(y));
      circle.setAttribute('r', '0.6');
      circle.classList.add('hitlayer__draft-point');
      this.#svg.appendChild(circle);
      return circle;
    });
  }

  clearDraft() {
    this.#draftPolyline?.remove();
    this.#draftPolyline = null;
    this.#draftPointElements.forEach((point) => point.remove());
    this.#draftPointElements = [];
  }

  clear() {
    this.#polygonElements.forEach((polygon) => polygon.remove());
    this.#polygonElements.clear();
    this.clearDraft();
  }
}
