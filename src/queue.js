class AsyncQueue {
  constructor() {
    this.items = [];
    this.processing = false;
  }

  enqueue(item) {
    this.items.push(item);
  }

  async processAll(handler) {
    const results = [];
    // Simulates non-deterministic async processing order
    const promises = this.items.map(item =>
      new Promise(resolve => {
        const delay = Math.floor(Math.random() * 50);
        setTimeout(() => resolve(handler(item)), delay);
      })
    );
    const settled = await Promise.all(promises);
    results.push(...settled);
    this.items = [];
    return results;
  }

  size() {
    return this.items.length;
  }
}

module.exports = AsyncQueue;
