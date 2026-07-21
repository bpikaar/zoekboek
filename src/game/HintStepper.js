/**
 * Visualizes the hint cascade as a row of chips, one per keyword of the
 * current target: "?" until revealed, then the actual word. The active
 * chip's badge sits inside a ring that drains all the way around over
 * exactly the real wait — 3s before the next hint, or, on the last
 * keyword, the longer 10s wait before the round is skipped — so the
 * remaining time stays visible for its whole span rather than just
 * flashing briefly.
 *
 * The first keyword is what's actually being searched for; the rest
 * are just extra clues if that's not enough. A 🔍 badge plus a divider
 * sets that first chip apart from the numbered 💡 hint chips after it.
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
      const isTarget = index === 0;

      if (index === 1) {
        const divider = document.createElement('div');
        divider.className = 'hint-stepper__divider';
        divider.textContent = '💡';
        divider.title = 'Extra hints';
        this.#element.appendChild(divider);
      } else if (index > 1) {
        const connector = document.createElement('div');
        connector.className = 'hint-stepper__connector';
        this.#element.appendChild(connector);
      }

      const roleClass = isTarget ? 'hint-stepper__chip--target' : 'hint-stepper__chip--hint';
      const badge = isTarget ? '🔍' : String(index); // hint chips are numbered 1, 2, 3... on their own

      const chip = document.createElement('div');
      chip.className = `hint-stepper__chip hint-stepper__chip--pending ${roleClass}`;
      chip.innerHTML = `
        <span class="hint-stepper__index-wrap">
          <svg class="hint-stepper__ring" viewBox="0 0 26 26">
            <circle class="hint-stepper__ring-track" cx="13" cy="13" r="11" />
            <circle class="hint-stepper__ring-progress" cx="13" cy="13" r="11" />
          </svg>
          <span class="hint-stepper__index">${badge}</span>
        </span>
        <span class="hint-stepper__word">?</span>
      `;
      this.#element.appendChild(chip);
      this.#chips.push({ chip, roleClass, wordElement: chip.querySelector('.hint-stepper__word') });
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
        chipEntry.chip.className = `hint-stepper__chip hint-stepper__chip--revealed ${chipEntry.roleClass}`;
      }
    });

    entry.wordElement.textContent = word;
    const finalClass = isFinal ? ' hint-stepper__chip--final' : '';
    entry.chip.className = `hint-stepper__chip hint-stepper__chip--active ${entry.roleClass}${finalClass}`;
    entry.chip.style.setProperty('--pulse-duration', `${durationMs}ms`);

    this.#element.querySelectorAll('.hint-stepper__connector').forEach((connector, i) => {
      connector.classList.toggle('hint-stepper__connector--filled', i + 2 <= index);
    });
  }

  clear() {
    this.#element?.remove();
    this.#element = null;
    this.#chips = [];
  }
}
