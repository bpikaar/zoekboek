/**
 * Lets the user grab the scene strip with the mouse (or touch/pen, via
 * Pointer Events) and drag it horizontally, or pan it with a two-finger
 * trackpad swipe (via wheel events). Clamped so it never scrolls past
 * the first or last scene.
 */
export class DragScroller {
  #viewport;
  #track;
  #onDragStart;

  #translateX = 0;
  #dragStartX = 0;
  #dragStartTranslateX = 0;
  #isDragging = false;
  #activePointerId = null;

  constructor(viewport, track, { onDragStart } = {}) {
    this.#viewport = viewport;
    this.#track = track;
    this.#onDragStart = onDragStart;

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
