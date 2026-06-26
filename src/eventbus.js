class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  on(event, handler) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push({ handler, once: false });
    return this;
  }

  once(event, handler) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push({ handler, once: true });
    return this;
  }

  off(event, handler) {
    if (!this._listeners.has(event)) return this;
    const remaining = this._listeners.get(event).filter(e => e.handler !== handler);
    if (remaining.length === 0) {
      this._listeners.delete(event);
    } else {
      this._listeners.set(event, remaining);
    }
    return this;
  }

  emit(event, ...args) {
    if (!this._listeners.has(event)) return false;
    const entries = this._listeners.get(event).slice();
    const onceHandlers = entries.filter(e => e.once).map(e => e.handler);
    onceHandlers.forEach(h => this.off(event, h));
    entries.forEach(e => e.handler(...args));
    return entries.length > 0;
  }

  listenerCount(event) {
    return this._listeners.has(event) ? this._listeners.get(event).length : 0;
  }

  eventNames() {
    return [...this._listeners.keys()];
  }

  removeAllListeners(event) {
    if (event) {
      this._listeners.delete(event);
    } else {
      this._listeners.clear();
    }
    return this;
  }
}

module.exports = EventBus;
