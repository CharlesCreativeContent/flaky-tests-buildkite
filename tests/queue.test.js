/**
 * Flakiness: non-deterministic async ordering.
 * processAll() uses random delays per item, so result order varies between runs.
 */
const AsyncQueue = require('../src/queue');

describe('AsyncQueue', () => {
  let queue;

  beforeEach(() => {
    queue = new AsyncQueue();
  });

  test('enqueue increases size', () => {
    queue.enqueue('a');
    queue.enqueue('b');
    expect(queue.size()).toBe(2);
  });

  test('processAll empties the queue', async () => {
    queue.enqueue(1);
    queue.enqueue(2);
    await queue.processAll(x => x * 2);
    expect(queue.size()).toBe(0);
  });

  // FLAKY: processAll uses random per-item delays, so output order is non-deterministic
  test('processAll returns results in insertion order', async () => {
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    const results = await queue.processAll(x => x * 10);
    expect(results).toEqual([10, 20, 30]);
  });

  // FLAKY: same random-delay issue — first element may not resolve first
  test('first enqueued item is processed first', async () => {
    const order = [];
    queue.enqueue('first');
    queue.enqueue('second');
    await queue.processAll(x => {
      order.push(x);
      return x;
    });
    expect(order[0]).toBe('first');
  });

  // FLAKY: relies on all randoms being low enough to finish within 60ms
  test('processAll completes within 60ms for 5 items', async () => {
    [1, 2, 3, 4, 5].forEach(i => queue.enqueue(i));
    const start = Date.now();
    await queue.processAll(x => x);
    expect(Date.now() - start).toBeLessThan(60);
  });

  test('handler is called for every item', async () => {
    const called = [];
    queue.enqueue('a');
    queue.enqueue('b');
    queue.enqueue('c');
    await queue.processAll(x => { called.push(x); return x; });
    expect(called).toHaveLength(3);
  });
});
