/**
 * A brief hand-swipe animation that tells the child the picture can be
 * dragged to the left. Disappears the moment a drag actually starts.
 */
export class DragHint {
  #element;

  constructor(container) {
    this.#element = document.createElement('div');
    this.#element.className = 'drag-hint';
    this.#element.setAttribute('role', 'presentation');
    this.#element.innerHTML = `
      <span class="drag-hint__hand" aria-hidden="true">👆</span>
      <span class="drag-hint__text">Sleep de afbeelding naar links</span>
    `;

    container.appendChild(this.#element);
  }

  dismiss() {
    if (this.#element.classList.contains('drag-hint--dismissed')) return;

    this.#element.classList.add('drag-hint--dismissed');
    this.#element.addEventListener(
      'transitionend',
      () => this.#element.remove(),
      { once: true },
    );
  }
}
