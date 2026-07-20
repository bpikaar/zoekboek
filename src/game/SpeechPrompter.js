/**
 * Thin wrapper around the browser's native SpeechSynthesis API. Prefers
 * a Dutch voice when one is installed, and degrades to a silent no-op
 * where speech synthesis isn't available at all.
 *
 * Voices load asynchronously in most browsers, so the preferred voice
 * is (re)selected whenever the `voiceschanged` event fires.
 */
export class SpeechPrompter {
  #voice = null;

  constructor() {
    if (!this.isSupported) return;

    this.#selectVoice();
    speechSynthesis.addEventListener('voiceschanged', () => this.#selectVoice());
  }

  get isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  #selectVoice() {
    const voices = speechSynthesis.getVoices();
    this.#voice = voices.find((voice) => voice.lang?.startsWith('nl')) ?? voices[0] ?? null;
  }

  /** Resolves once the utterance has actually finished playing (or errored/was cancelled). */
  speak(text) {
    if (!this.isSupported || !text) return Promise.resolve();

    speechSynthesis.cancel();
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.#voice?.lang ?? 'nl-NL';
      if (this.#voice) utterance.voice = this.#voice;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      speechSynthesis.speak(utterance);
    });
  }
}
