/**
 * Visualizes the hint cascade as a row of numbered chips, one per
 * keyword of the current target: "?" until revealed, then the actual
 * word. The active chip pulses for exactly as long as the wait before
 * the next hint (3s), or — on the last keyword — a slower, differently
 * coloured pulse for the longer 10s wait before the round is skipped.
 */
export class HintStepper {
  #container;
  #element = null;
  #chips = [];

  constructor(container) {
    this.#container = container;
  }

  /** Rebuilds the row for a new round, one pending chip per keyword. */
  setKeywords(keywords) {
    this.clear();

    this.#element = document.createElement('div');
    this.#element.className = 'hint-stepper';

    keywords.forEach((_, index) => {
      if (index > 0) {
        const connector = document.createElement('div');
        connector.className = 'hint-stepper__connector';
        this.#element.appendChild(connector);
      }

      const chip = document.createElement('div');
      chip.className = 'hint-stepper__chip hint-stepper__chip--pending';
      chip.innerHTML = `
        <span class="hint-stepper__index">${index + 1}</span>
        <span class="hint-stepper__word">?</span>
        <span class="hint-stepper__pulse-ring"></span>
      `;
      this.#element.appendChild(chip);
      this.#chips.push({ chip, wordElement: chip.querySelector('.hint-stepper__word') });
    });

    this.#container.appendChild(this.#element);
  }

  /**
   * Reveals the hint at `index`, marks it active with a pulse timed to
   * `durationMs`, and settles any earlier chip to its "revealed" state.
   */
  activate(index, word, durationMs, { isFinal = false } = {}) {
    const entry = this.#chips[index];
    if (!entry || !this.#element) return;

    this.#chips.forEach((chipEntry, i) => {
      if (i < index) {
        chipEntry.chip.className = 'hint-stepper__chip hint-stepper__chip--revealed';
      }
    });

    entry.wordElement.textContent = word;
    entry.chip.className = `hint-stepper__chip hint-stepper__chip--active${isFinal ? ' hint-stepper__chip--final' : ''}`;
    entry.chip.style.setProperty('--pulse-duration', `${durationMs}ms`);

    this.#element.querySelectorAll('.hint-stepper__connector').forEach((connector, i) => {
      connector.classList.toggle('hint-stepper__connector--filled', i < index);
    });
  }

  clear() {
    this.#element?.remove();
    this.#element = null;
    this.#chips = [];
  }
}
