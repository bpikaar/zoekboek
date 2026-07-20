import { SceneGallery } from './SceneGallery.js';
import { DragHint } from './DragHint.js';
import { FindablesRepository } from '../findables/FindablesRepository.js';
import { SeekGame } from '../game/SeekGame.js';
import { RepeatPromptButton } from '../game/RepeatPromptButton.js';

export class SeekBookApp {
  #root;
  #gallery;
  #hint;
  #game;

  constructor(root) {
    this.#root = root;
  }

  async init() {
    this.#gallery = new SceneGallery(this.#root, {
      onDragStart: () => this.#handleFirstInteraction(),
      onClick: (event) => this.#game?.handleClick(event),
    });
    this.#hint = new DragHint(this.#gallery.viewport);

    const repository = await FindablesRepository.load();
    this.#gallery.strip.slots.forEach((_, index) => {
      this.#gallery.strip.getOverlay(index).setPolygons(repository.getScene(index));
    });

    this.#game = new SeekGame(this.#gallery, repository);
    if (this.#game.hasFindables) {
      new RepeatPromptButton(this.#gallery.viewport, () => this.#game.askOrRepeat());
    }

    await this.#gallery.eagerLoadFirstScenes();
  }

  #handleFirstInteraction() {
    this.#hint.dismiss();
    this.#game?.start();
  }
}
