const CLICK_DISTANCE_THRESHOLD_PX = 6;

/**
 * Lets the user grab the scene strip with the mouse (or touch/pen, via
 * Pointer Events) and drag it horizontally, or pan it with a two-finger
 * trackpad swipe (via wheel events). Clamped so it never scrolls past
 * the first or last scene.
 *
 * A pointer press released with barely any movement is reported via
 * `onClick` instead of being treated as a drag, so callers can react to
 * taps on the artwork itself (e.g. hit-testing a findable object).
 */
export class DragScroller {
  #viewport;
  #track;
  #onDragStart;
  #onClick;

  #translateX = 0;
  #dragStartX = 0;
  #dragStartY = 0;
  #dragStartTranslateX = 0;
  #isDragging = false;
  #activePointerId = null;

  constructor(viewport, track, { onDragStart, onClick } = {}) {
    this.#viewport = viewport;
    this.#track = track;
    this.#onDragStart = onDragStart;
    this.#onClick = onClick;

    this.#viewport.addEventListener('pointerdown', this.#handlePointerDown);
    this.#viewport.addEventListener('pointermove', this.#handlePointerMove);
    this.#viewport.addEventListener('pointerup', this.#handlePointerEnd);
    this.#viewport.addEventListener('pointercancel', this.#handlePointerEnd);
    this.#viewport.addEventListener('wheel', this.#handleWheel, { passive: false });
    window.addEventListener('resize', this.#applyClampedTranslate);
  }

  #handlePointerDown = (event) => {
    this.#isDragging = true;
    this.#activePointerId = event.pointerId;
    this.#viewport.setPointerCapture(event.pointerId);

    this.#dragStartX = event.clientX;
    this.#dragStartY = event.clientY;
    this.#dragStartTranslateX = this.#translateX;

    this.#viewport.classList.add('is-dragging');
    this.#onDragStart?.();
  };

  #handlePointerMove = (event) => {
    if (!this.#isDragging) return;

    const delta = event.clientX - this.#dragStartX;
    this.#translateX = this.#dragStartTranslateX + delta;
    this.#applyClampedTranslate();
  };

  #handlePointerEnd = (event) => {
    if (!this.#isDragging) return;

    this.#isDragging = false;
    this.#viewport.classList.remove('is-dragging');

    if (this.#activePointerId !== null) {
      this.#viewport.releasePointerCapture(this.#activePointerId);
      this.#activePointerId = null;
    }

    const distance = Math.hypot(
      event.clientX - this.#dragStartX,
      event.clientY - this.#dragStartY,
    );
    if (distance <= CLICK_DISTANCE_THRESHOLD_PX) {
      this.#onClick?.(event);
    }
  };

  #handleWheel = (event) => {
    event.preventDefault();

    const delta = event.deltaX !== 0 ? event.deltaX : event.deltaY;
    this.#translateX -= delta;
    this.#applyClampedTranslate();

    this.#onDragStart?.();
  };

  #getMinTranslateX() {
    return Math.min(0, this.#viewport.clientWidth - this.#track.scrollWidth);
  }

  #applyClampedTranslate = () => {
    const min = this.#getMinTranslateX();
    this.#translateX = Math.max(min, Math.min(0, this.#translateX));
    this.#track.style.transform = `translate3d(${this.#translateX}px, 0, 0)`;
  };
}
