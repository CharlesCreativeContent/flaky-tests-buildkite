const AsyncQueue = require('../src/queue');

describe('AsyncQueue', () => {
  let queue;

  beforeEach(() => {
    queue = new AsyncQueue();
    // Eliminate random delays so async ordering is deterministic
    jest.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

  test('processAll applies handler to every item', async () => {
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    const results = await queue.processAll(x => x * 10);
    expect(results).toHaveLength(3);
    expect(results).toEqual(expect.arrayContaining([10, 20, 30]));
  });

  test('processAll on empty queue returns empty array', async () => {
    const results = await queue.processAll(x => x);
    expect(results).toEqual([]);
  });

  test('handler receives each enqueued value', async () => {
    const seen = [];
    queue.enqueue('a');
    queue.enqueue('b');
    queue.enqueue('c');
    await queue.processAll(x => { seen.push(x); return x; });
    expect(seen).toEqual(expect.arrayContaining(['a', 'b', 'c']));
    expect(seen).toHaveLength(3);
  });

  test('size returns 0 after processAll', async () => {
    queue.enqueue(1);
    queue.enqueue(2);
    await queue.processAll(x => x);
    expect(queue.size()).toBe(0);
  });

  test('queue can be reused after processAll', async () => {
    queue.enqueue(1);
    await queue.processAll(x => x);
    queue.enqueue(2);
    expect(queue.size()).toBe(1);
  });
});
