const DEFAULT_URL = '/findables.json';

/**
 * Holds the findable objects for every scene: `{ id, label, clue, polygon }`
 * where `polygon` is a list of `[x, y]` points in percentages (0-100)
 * relative to that scene's image. Loaded from — and, in the authoring
 * tool, exported back to — a plain JSON file so no backend is needed.
 */
export class FindablesRepository {
  #findablesByScene;

  constructor(findablesByScene) {
    this.#findablesByScene = findablesByScene;
  }

  static async load(url = DEFAULT_URL) {
    const response = await fetch(url);
    const findablesByScene = await response.json();
    return new FindablesRepository(findablesByScene);
  }

  getScene(sceneIndex) {
    return this.#findablesByScene[sceneIndex] ?? [];
  }

  get all() {
    return this.#findablesByScene;
  }

  add(sceneIndex, findable) {
    if (!this.#findablesByScene[sceneIndex]) {
      this.#findablesByScene[sceneIndex] = [];
    }
    this.#findablesByScene[sceneIndex].push(findable);
  }

  remove(sceneIndex, id) {
    const scene = this.#findablesByScene[sceneIndex];
    if (!scene) return;

    const index = scene.findIndex((findable) => findable.id === id);
    if (index !== -1) scene.splice(index, 1);
  }

  toJSON() {
    return JSON.stringify(this.#findablesByScene, null, 2);
  }
}
