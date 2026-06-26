const Cache = require('../src/cache');

describe('Cache', () => {
  let cache;

  beforeEach(() => {
    jest.useFakeTimers();
    cache = new Cache(100);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('returns value immediately after set', () => {
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });

  test('returns null for missing key', () => {
    expect(cache.get('missing')).toBeNull();
  });

  test('entry expires after TTL', () => {
    cache.set('expiring', 42);
    jest.advanceTimersByTime(101);
    expect(cache.get('expiring')).toBeNull();
  });

  test('entry is still alive before TTL elapses', () => {
    cache.set('alive', 'yes');
    jest.advanceTimersByTime(80);
    expect(cache.get('alive')).toBe('yes');
  });

  test('second entry expires independently of first', () => {
    cache.set('a', 1);
    jest.advanceTimersByTime(40);
    cache.set('b', 2);
    jest.advanceTimersByTime(70);
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBe(2);
  });

  test('clear removes all entries', () => {
    cache.set('x', 1);
    cache.set('y', 2);
    cache.clear();
    expect(cache.get('x')).toBeNull();
    expect(cache.get('y')).toBeNull();
  });

  test('overwriting a key resets its TTL', () => {
    cache.set('k', 'first');
    jest.advanceTimersByTime(80);
    cache.set('k', 'second');
    jest.advanceTimersByTime(80);
    expect(cache.get('k')).toBe('second');
  });
});
