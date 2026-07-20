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

      slot.appendChild(image);
      trackElement.appendChild(slot);

      this.#slots.push({ slot, image, loaded: false });
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
}
