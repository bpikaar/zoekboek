/**
 * A small floating button that lets the visitor re-hear (or, if the
 * game hasn't started yet, kick off) the current spoken prompt.
 */
export class RepeatPromptButton {
  constructor(container, onPress) {
    this.element = document.createElement('button');
    this.element.type = 'button';
    this.element.className = 'repeat-prompt';
    this.element.textContent = '🔊 Herhaal';
    // Stop the press from reaching the viewport's DragScroller — otherwise
    // its setPointerCapture() on pointerdown redirects the click away from
    // this button before it ever fires.
    this.element.addEventListener('pointerdown', (event) => event.stopPropagation());
    this.element.addEventListener('click', onPress);

    container.appendChild(this.element);
  }
}
