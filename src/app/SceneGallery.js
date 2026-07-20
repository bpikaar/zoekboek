import { SCENE_COUNT, SCENE_ASPECT_RATIO, EAGER_LOAD_COUNT, getScenePath } from '../config/scenes.js';
import { ImagePreloader } from './ImagePreloader.js';
import { SceneStrip } from './SceneStrip.js';
import { SceneLoader } from './SceneLoader.js';
import { DragScroller } from './DragScroller.js';
import { SceneCoordinateMapper } from '../geometry/SceneCoordinateMapper.js';

/**
 * The draggable scene strip itself — viewport, track, scenes, lazy
 * loading and drag/scroll handling — without any of the app-specific
 * chrome (drag hint, findable-object game logic, authoring UI, ...)
 * built on top of it. Shared by the visitor-facing app and the
 * authoring tool so both work with the exact same gallery mechanics.
 */
export class SceneGallery {
  #preloader = new ImagePreloader();
  #sceneLoader;

  viewport;
  track;
  strip;
  coordinateMapper;

  constructor(root, { onDragStart, onClick } = {}) {
    this.viewport = document.createElement('div');
    this.viewport.className = 'viewport';

    this.track = document.createElement('div');
    this.track.className = 'track';

    this.viewport.appendChild(this.track);
    root.appendChild(this.viewport);

    this.strip = new SceneStrip(this.track, SCENE_COUNT);
    this.coordinateMapper = new SceneCoordinateMapper(this.viewport, this.track, SCENE_ASPECT_RATIO);

    this.#sceneLoader = new SceneLoader(this.strip, this.#preloader, this.viewport);
    new DragScroller(this.viewport, this.track, { onDragStart, onClick });
  }

  async eagerLoadFirstScenes() {
    const preloads = Array.from({ length: EAGER_LOAD_COUNT }, (_, index) =>
      this.#preloader.preload(getScenePath(index)),
    );
    await Promise.all(preloads);

    this.#sceneLoader.loadFrom(0);
  }
}
