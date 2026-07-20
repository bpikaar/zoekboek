export const SCENE_COUNT = 7;

export const SCENE_ASPECT_RATIO = 3191 / 2079;

export const EAGER_LOAD_COUNT = 2;

export function getScenePath(index) {
  return `/images/${index + 1}.jpg`;
}
