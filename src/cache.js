class Cache {
  constructor(ttlMs = 1000) {
    this.store = new Map();
    this.ttl = ttlMs;
  }

  set(key, value) {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttl });
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  clear() {
    this.store.clear();
  }
}

module.exports = Cache;
