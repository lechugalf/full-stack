/**
 * Simple cache implementation using a singleton pattern.
 */

class Cache {
  constructor() {
    if (!Cache.instance) {
      this.store = new Map();
      Cache.instance = this;
    }
    return Cache.instance;
  }

  get(key) {
    return this.store.get(key);
  }

  set(key, value) {
    this.store.set(key, value);
  }

  clear(key) {
    if (key) this.store.delete(key);
    else this.store.clear();
  }
}

const instance = new Cache();
Object.freeze(instance);

module.exports = instance;
