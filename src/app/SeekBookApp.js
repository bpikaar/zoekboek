import { SCENE_COUNT, EAGER_LOAD_COUNT, getScenePath } from '../config/scenes.js';
import { ImagePreloader } from './ImagePreloader.js';
import { SceneStrip } from './SceneStrip.js';
import { SceneLoader } from './SceneLoader.js';
import { DragScroller } from './DragScroller.js';
import { DragHint } from './DragHint.js';

export class SeekBookApp {
  #root;
  #preloader = new ImagePreloader();

  constructor(root) {
    this.#root = root;
  }

  async init() {
    const { viewport, track } = this.#buildLayout();

    const strip = new SceneStrip(track, SCENE_COUNT);
    const hint = new DragHint(viewport);
    const sceneLoader = new SceneLoader(strip, this.#preloader, viewport);

    new DragScroller(viewport, track, {
      onDragStart: () => hint.dismiss(),
    });

    await this.#eagerLoadFirstScenes(sceneLoader);
  }

  #buildLayout() {
    const viewport = document.createElement('div');
    viewport.className = 'viewport';

    const track = document.createElement('div');
    track.className = 'track';

    viewport.appendChild(track);
    this.#root.appendChild(viewport);

    return { viewport, track };
  }

  async #eagerLoadFirstScenes(sceneLoader) {
    const preloads = Array.from({ length: EAGER_LOAD_COUNT }, (_, index) =>
      this.#preloader.preload(getScenePath(index)),
    );
    await Promise.all(preloads);

    sceneLoader.loadFrom(0);
  }
}
