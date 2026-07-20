import { SceneGallery } from '../app/SceneGallery.js';
import { FindablesRepository } from '../findables/FindablesRepository.js';
import { PolygonDraft } from './PolygonDraft.js';
import { AuthoringPanel } from './AuthoringPanel.js';
import { downloadJSON } from './downloadJSON.js';

function slugify(text) {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'object'
  );
}

export class AuthoringApp {
  #root;
  #gallery;
  #panel;
  #repository;
  #draft = new PolygonDraft();
  #findableCounter = 0;

  constructor(root) {
    this.#root = root;
  }

  async init() {
    const layout = document.createElement('div');
    layout.className = 'authoring-layout';
    this.#root.appendChild(layout);

    const galleryRoot = document.createElement('div');
    galleryRoot.className = 'authoring-gallery';
    layout.appendChild(galleryRoot);

    const panelRoot = document.createElement('div');
    layout.appendChild(panelRoot);

    this.#gallery = new SceneGallery(galleryRoot, {
      onClick: (event) => this.#handleGalleryClick(event),
    });

    this.#repository = await FindablesRepository.load();
    this.#gallery.strip.slots.forEach((_, index) => {
      const overlay = this.#gallery.strip.getOverlay(index);
      overlay.setEditable(true);
      overlay.setPolygons(this.#repository.getScene(index));
    });

    this.#panel = new AuthoringPanel(panelRoot, {
      onUndo: () => this.#undoPoint(),
      onCancel: () => this.#cancelDraft(),
      onSave: (label, clue) => this.#saveDraft(label, clue),
      onExport: () => downloadJSON('findables.json', this.#repository.toJSON()),
      onDelete: (sceneIndex, id) => this.#delete(sceneIndex, id),
    });
    this.#refreshList();
    this.#refreshStatus();

    await this.#gallery.eagerLoadFirstScenes();
  }

  #handleGalleryClick(event) {
    const { sceneIndex, x, y } = this.#gallery.coordinateMapper.fromPointerEvent(event);
    const accepted = this.#draft.addPoint(sceneIndex, x, y);

    if (!accepted) {
      this.#panel.setStatus('Blijf op dezelfde plaat om deze vorm af te maken (of annuleer eerst).');
      return;
    }

    this.#gallery.strip.getOverlay(sceneIndex).setDraft(this.#draft.points);
    this.#refreshStatus();
  }

  #undoPoint() {
    const sceneIndex = this.#draft.sceneIndex;
    if (sceneIndex === null) return;

    this.#draft.undoLastPoint();
    const overlay = this.#gallery.strip.getOverlay(sceneIndex);
    if (this.#draft.points.length === 0) {
      overlay.clearDraft();
    } else {
      overlay.setDraft(this.#draft.points);
    }
    this.#refreshStatus();
  }

  #cancelDraft() {
    const sceneIndex = this.#draft.sceneIndex;
    if (sceneIndex !== null) {
      this.#gallery.strip.getOverlay(sceneIndex).clearDraft();
    }
    this.#draft.reset();
    this.#refreshStatus();
  }

  #saveDraft(label, clue) {
    if (!this.#draft.isValid) {
      this.#panel.setStatus('Teken minstens 3 punten voor je opslaat.');
      return;
    }
    if (!label) {
      this.#panel.setStatus('Geef het object een naam voor je opslaat.');
      return;
    }

    const sceneIndex = this.#draft.sceneIndex;
    this.#findableCounter += 1;

    const findable = {
      id: `scene${sceneIndex}-${slugify(label)}-${this.#findableCounter}`,
      label,
      clue: clue || `Zoek: ${label}`,
      polygon: this.#draft.points,
    };

    this.#repository.add(sceneIndex, findable);
    this.#gallery.strip.getOverlay(sceneIndex).setPolygons(this.#repository.getScene(sceneIndex));

    this.#draft.reset();
    this.#panel.clearForm();
    this.#refreshList();
    this.#refreshStatus();
  }

  #delete(sceneIndex, id) {
    this.#repository.remove(sceneIndex, id);
    this.#gallery.strip.getOverlay(sceneIndex).setPolygons(this.#repository.getScene(sceneIndex));
    this.#refreshList();
  }

  #refreshStatus() {
    const count = this.#draft.points.length;

    if (count === 0) {
      this.#panel.setStatus('Klik op de afbeelding om een nieuwe vorm te starten.');
    } else {
      const pointsLabel = `${count} punt${count === 1 ? '' : 'en'}`;
      const hint = count < 3 ? ' (minimaal 3 nodig)' : '';
      this.#panel.setStatus(`Plaat ${this.#draft.sceneIndex + 1} — ${pointsLabel} geplaatst${hint}.`);
    }

    this.#panel.setSaveEnabled(this.#draft.isValid);
  }

  #refreshList() {
    const entries = this.#repository.all.flatMap((findables, sceneIndex) =>
      findables.map((findable) => ({ sceneIndex, findable })),
    );
    this.#panel.renderList(entries);
  }
}
