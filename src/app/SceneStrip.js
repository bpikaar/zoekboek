import { PolygonOverlay } from '../findables/PolygonOverlay.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export class SceneStrip {
  #slots = [];

  constructor(trackElement, count) {
    for (let index = 0; index < count; index += 1) {
      const slot = document.createElement('div');
      slot.className = 'strip__slot';
      slot.dataset.index = String(index);

      const image = document.createElement('img');
      image.className = 'strip__image';
      image.alt = `Zoekplaat ${index + 1}`;
      image.draggable = false;

      const hitLayer = document.createElementNS(SVG_NS, 'svg');
      hitLayer.setAttribute('viewBox', '0 0 100 100');
      hitLayer.setAttribute('preserveAspectRatio', 'none');
      hitLayer.classList.add('strip__hitlayer');

      slot.appendChild(image);
      slot.appendChild(hitLayer);
      trackElement.appendChild(slot);

      this.#slots.push({
        slot,
        image,
        loaded: false,
        overlay: new PolygonOverlay(hitLayer),
      });
    }
  }

  get slots() {
    return this.#slots;
  }

  reveal(index, src) {
    const entry = this.#slots[index];
    if (!entry || entry.loaded) return;

    entry.image.src = src;
    entry.loaded = true;
    entry.slot.classList.add('strip__slot--loaded');
  }

  getOverlay(index) {
    return this.#slots[index]?.overlay ?? null;
  }
}
