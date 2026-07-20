/**
 * Converts a pointer event's screen position into a scene index plus a
 * position expressed as a percentage (0-100) of that scene's image —
 * the same coordinate space findable-object polygons are stored in.
 *
 * Every scene shares the same aspect ratio and is rendered at the
 * viewport's full height, so every scene has the same rendered width.
 * That width, together with the track's untransformed bounding box
 * (which already reflects the current drag offset), is all that's
 * needed to locate a point.
 */
export class SceneCoordinateMapper {
  #viewport;
  #track;
  #sceneAspectRatio;

  constructor(viewport, track, sceneAspectRatio) {
    this.#viewport = viewport;
    this.#track = track;
    this.#sceneAspectRatio = sceneAspectRatio;
  }

  fromPointerEvent(event) {
    const viewportRect = this.#viewport.getBoundingClientRect();
    const trackRect = this.#track.getBoundingClientRect();

    const sceneWidth = viewportRect.height * this.#sceneAspectRatio;
    const trackX = event.clientX - trackRect.left;
    const viewportY = event.clientY - viewportRect.top;

    const sceneIndex = Math.floor(trackX / sceneWidth);
    const localX = trackX - sceneIndex * sceneWidth;

    return {
      sceneIndex,
      x: (localX / sceneWidth) * 100,
      y: (viewportY / viewportRect.height) * 100,
    };
  }
}
