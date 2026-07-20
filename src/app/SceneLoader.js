import { getScenePath } from '../config/scenes.js';

/**
 * Reveals a scene as soon as it scrolls into view, and preloads the
 * next scene ahead of time so dragging into it never stutters.
 */
export class SceneLoader {
  #strip;
  #preloader;
  #observer;

  constructor(strip, preloader, viewportElement) {
    this.#strip = strip;
    this.#preloader = preloader;

    this.#observer = new IntersectionObserver(this.#handleIntersect, {
      root: viewportElement,
      threshold: 0.1,
    });

    strip.slots.forEach(({ slot }) => this.#observer.observe(slot));
  }

  #handleIntersect = (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const index = Number(entry.target.dataset.index);
      this.loadFrom(index);
    });
  };

  loadFrom(index) {
    this.#loadIndex(index);
    this.#loadIndex(index + 1);
  }

  #loadIndex(index) {
    if (index < 0 || index >= this.#strip.slots.length) return;

    const src = getScenePath(index);
    this.#preloader.preload(src).then((image) => this.#strip.reveal(index, image.src));
  }
}
