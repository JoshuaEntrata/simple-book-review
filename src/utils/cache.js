class SimpleCache {
  constructor() {
    this.store = new Map();
  }

  set(key, value, ttlSeconds = null) {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  get(key) {
    const data = this.store.get(key);
    if (!data) return null;
    if (data.expiresAt && data.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return data.value;
  }

  del(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

module.exports = new SimpleCache();
