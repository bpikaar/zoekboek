/**
 * A star that pops up at the click position and fades away — the
 * "positive animation" shown on top of the green polygon flash when
 * the visitor finds the right object.
 */
export class FeedbackBadge {
  #container;

  constructor(container) {
    this.#container = container;
  }

  celebrate(clientX, clientY) {
    const rect = this.#container.getBoundingClientRect();

    const badge = document.createElement('div');
    badge.className = 'feedback-badge';
    badge.textContent = '⭐';
    badge.style.left = `${clientX - rect.left}px`;
    badge.style.top = `${clientY - rect.top}px`;

    this.#container.appendChild(badge);
    badge.addEventListener('animationend', () => badge.remove(), { once: true });
  }
}
