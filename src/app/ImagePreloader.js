export class ImagePreloader {
  #cache = new Map();

  preload(src) {
    if (this.#cache.has(src)) {
      return this.#cache.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Kon afbeelding niet laden: ${src}`));
      image.src = src;
    });

    this.#cache.set(src, promise);
    return promise;
  }
}
