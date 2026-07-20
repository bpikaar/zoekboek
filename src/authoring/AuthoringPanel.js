/**
 * The side panel of the authoring tool: the label/clue form, draft
 * status, the list of findables already placed, and the export button.
 * Purely a view — all decisions are made by AuthoringApp and passed in
 * as callbacks.
 */
export class AuthoringPanel {
  #root;
  #labelInput;
  #clueInput;
  #statusElement;
  #listElement;
  #saveButton;
  #onDelete;

  constructor(container, { onUndo, onCancel, onSave, onExport, onDelete }) {
    this.#onDelete = onDelete;

    this.#root = document.createElement('div');
    this.#root.className = 'authoring-panel';
    this.#root.innerHTML = `
      <h1>Zoekboek — objecten tekenen</h1>
      <p class="authoring-panel__help">
        Klik punten op de afbeelding om een vorm rond een object te tekenen
        (minimaal 3 punten). Slepen blijft pannen tussen de platen.
      </p>

      <div class="authoring-panel__status" data-role="status"></div>

      <div class="authoring-panel__field">
        <label for="findable-label">Naam</label>
        <input id="findable-label" type="text" placeholder="Rode scooter" />
      </div>
      <div class="authoring-panel__field">
        <label for="findable-clue">Zoek-tekst</label>
        <textarea id="findable-clue" rows="2" placeholder="Zoek de man op de rode scooter"></textarea>
      </div>

      <div class="authoring-panel__actions">
        <button type="button" data-action="undo">Punt ongedaan maken</button>
        <button type="button" data-action="cancel">Vorm annuleren</button>
        <button type="button" data-action="save" class="authoring-panel__save">Object opslaan</button>
      </div>

      <h2>Objecten</h2>
      <ul class="authoring-panel__list" data-role="list"></ul>

      <button type="button" data-action="export" class="authoring-panel__export">Exporteer findables.json</button>
    `;
    container.appendChild(this.#root);

    this.#labelInput = this.#root.querySelector('#findable-label');
    this.#clueInput = this.#root.querySelector('#findable-clue');
    this.#statusElement = this.#root.querySelector('[data-role="status"]');
    this.#listElement = this.#root.querySelector('[data-role="list"]');
    this.#saveButton = this.#root.querySelector('[data-action="save"]');

    this.#root.querySelector('[data-action="undo"]').addEventListener('click', onUndo);
    this.#root.querySelector('[data-action="cancel"]').addEventListener('click', onCancel);
    this.#root.querySelector('[data-action="export"]').addEventListener('click', onExport);
    this.#saveButton.addEventListener('click', () => {
      onSave(this.#labelInput.value.trim(), this.#clueInput.value.trim());
    });
  }

  setStatus(text) {
    this.#statusElement.textContent = text;
  }

  setSaveEnabled(enabled) {
    this.#saveButton.disabled = !enabled;
  }

  clearForm() {
    this.#labelInput.value = '';
    this.#clueInput.value = '';
  }

  renderList(entries) {
    this.#listElement.innerHTML = '';

    entries.forEach(({ sceneIndex, findable }) => {
      const item = document.createElement('li');
      item.className = 'authoring-panel__list-item';

      const text = document.createElement('span');
      text.textContent = `Plaat ${sceneIndex + 1} — ${findable.label}`;

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.textContent = 'Verwijderen';
      deleteButton.addEventListener('click', () => this.#onDelete(sceneIndex, findable.id));

      item.append(text, deleteButton);
      this.#listElement.appendChild(item);
    });
  }
}
