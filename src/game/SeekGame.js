import { HitTester } from '../findables/HitTester.js';
import { SpeechPrompter } from './SpeechPrompter.js';
import { FeedbackBadge } from './FeedbackBadge.js';
import { HintStepper } from './HintStepper.js';

const CELEBRATION_MS = 1200;
const HINT_INTERVAL_MS = 3000;
const SKIP_AFTER_LAST_HINT_MS = 10000;
// Forgives an imprecise tap near a polygon's edge — a finger is a much
// blunter pointer than a mouse, and this scene packs in ~100 small objects.
const TAP_TOLERANCE_PX = 10;

/**
 * Drives the actual seek-and-find game: asks (out loud) for a random
 * findable object, and reacts to clicks — green flash + a positive
 * animation on a correct hit, yellow flash on a wrong one. Stays on
 * the same target until the visitor finds it.
 *
 * The prompt starts with just the target's first keyword. If nothing
 * is found within a few seconds *after that keyword has finished being
 * spoken*, the next keyword is added as an extra hint, then the next,
 * and so on. If the last keyword has been spoken and still nothing is
 * found within 10 seconds, the round is skipped to a new question.
 * A HintStepper mirrors this timing visually, chip by chip.
 */
export class SeekGame {
  #gallery;
  #hitTester;
  #prompter;
  #feedback;
  #hintStepper;
  #allFindables;
  #currentTarget = null;
  #started = false;
  #locked = false;
  #hintIndex = 0;
  #hintTimer = null;
  /** @type {object | null} identifies the in-flight hint cascade, to ignore stale continuations */
  #cascadeToken = null;

  /**
   * @param {import('../app/SceneGallery.js').SceneGallery} gallery
   * @param {import('../findables/FindablesRepository.js').FindablesRepository} repository
   * @param {object} [options]
   * @param {SpeechPrompter} [options.prompter]
   * @param {FeedbackBadge} [options.feedback]
   * @param {HintStepper} [options.hintStepper]
   */
  constructor(gallery, repository, { prompter, feedback, hintStepper } = {}) {
    this.#gallery = gallery;
    this.#hitTester = new HitTester(repository);
    this.#prompter = prompter ?? new SpeechPrompter();
    this.#feedback = feedback ?? new FeedbackBadge(gallery.viewport);
    this.#hintStepper = hintStepper ?? new HintStepper(gallery.viewport);
    this.#allFindables = repository.all.flatMap((findables, sceneIndex) =>
      findables.map((findable) => ({ sceneIndex, findable })),
    );
  }

  get hasFindables() {
    return this.#allFindables.length > 0;
  }

  /** Idempotent: only the first call actually starts a round. */
  start() {
    if (this.#started || !this.hasFindables) return;
    this.#started = true;
    this.#pickNewTarget();
  }

  /** Starts the game if needed, otherwise repeats the most recent hint. */
  askOrRepeat() {
    if (!this.#started) {
      this.start();
    } else if (this.#currentTarget) {
      this.#speakCurrentHint();
    }
  }

  handleClick(event) {
    if (!this.#currentTarget || this.#locked) return;

    const { sceneIndex, x, y } = this.#gallery.coordinateMapper.fromPointerEvent(event);
    const scale = this.#gallery.coordinateMapper.getPixelScale();
    const hit = this.#hitTester.test(sceneIndex, x, y, { tolerancePx: TAP_TOLERANCE_PX, scale });
    if (!hit) return;

    const overlay = this.#gallery.strip.getOverlay(sceneIndex);

    if (hit.id === this.#currentTarget.findable.id) {
      this.#locked = true;
      this.#clearHintTimer();
      this.#cascadeToken = null; // invalidate any hint step still waiting on speech to finish
      this.#hintStepper.clear();
      overlay.flash(hit.id, 'correct');
      this.#feedback.celebrate(event.clientX, event.clientY);
      setTimeout(() => {
        this.#locked = false;
        this.#pickNewTarget();
      }, CELEBRATION_MS);
    } else {
      overlay.flash(hit.id, 'wrong');
    }
  }

  #pickNewTarget() {
    const others = this.#allFindables.filter(
      (entry) => entry.findable.id !== this.#currentTarget?.findable.id,
    );
    const pool = others.length > 0 ? others : this.#allFindables;
    this.#currentTarget = pool[Math.floor(Math.random() * pool.length)];
    this.#hintStepper.setKeywords(this.#currentTargetKeywords());
    this.#startHintCascade();
  }

  #startHintCascade() {
    this.#clearHintTimer();
    this.#hintIndex = 0;
    const token = {};
    this.#cascadeToken = token;
    this.#runHintStep(token);
  }

  /**
   * Speaks the current hint, then — once it has actually finished playing
   * and this is still the active round — schedules the next one.
   * @param {object} token
   */
  #runHintStep(token) {
    this.#speakCurrentHint().then(() => {
      if (token !== this.#cascadeToken) return;
      this.#scheduleNextHint(token);
    });
  }

  /** @param {object} token */
  #scheduleNextHint(token) {
    const keywords = this.#currentTargetKeywords();
    const isLastKeyword = this.#hintIndex >= keywords.length - 1;

    this.#hintTimer = setTimeout(() => {
      if (token !== this.#cascadeToken) return;

      if (isLastKeyword) {
        this.#pickNewTarget(); // nobody found it in time — move on to a new question
      } else {
        this.#hintIndex += 1;
        this.#runHintStep(token);
      }
    }, isLastKeyword ? SKIP_AFTER_LAST_HINT_MS : HINT_INTERVAL_MS);
  }

  #clearHintTimer() {
    if (this.#hintTimer === null) return;
    clearTimeout(this.#hintTimer);
    this.#hintTimer = null;
  }

  #speakCurrentHint() {
    const keywords = this.#currentTargetKeywords();
    const word = keywords[Math.min(this.#hintIndex, keywords.length - 1)];
    const prefix = this.#hintIndex === 0 ? 'Ik zie ik zie wat jij niet ziet en het is: ' : '';

    const isFinal = this.#hintIndex >= keywords.length - 1;
    this.#hintStepper.activate(this.#hintIndex, word, isFinal ? SKIP_AFTER_LAST_HINT_MS : HINT_INTERVAL_MS, {
      isFinal,
    });

    return this.#prompter.speak(`${prefix}${word}`);
  }

  #currentTargetKeywords() {
    const { findable } = this.#currentTarget;
    return findable.keywords?.length ? findable.keywords : [findable.label];
  }
}
