/**
 * Flakiness: timing-dependent TTL expiry.
 * The cache TTL is 100ms. Tests that sleep near the boundary
 * pass or fail depending on system load and timer precision.
 */
const Cache = require('../src/cache');

describe('Cache', () => {
  let cache;

  beforeEach(() => {
    cache = new Cache(100); // 100ms TTL
  });

  test('returns value immediately after set', () => {
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });

  test('returns null for missing key', () => {
    expect(cache.get('missing')).toBeNull();
  });

  // FLAKY: sleeps for exactly the TTL — may expire before or after get() depending on load
  test('entry expires after TTL', async () => {
    cache.set('expiring', 42);
    await new Promise(r => setTimeout(r, 100));
    expect(cache.get('expiring')).toBeNull();
  });

  // FLAKY: entry should still be alive at 80ms but under load the timer fires late
  test('entry is still alive before TTL elapses', async () => {
    cache.set('alive', 'yes');
    await new Promise(r => setTimeout(r, 80));
    expect(cache.get('alive')).toBe('yes');
  });

  // FLAKY: two back-to-back timers — cumulative drift makes the second assertion unreliable
  test('second entry expires independently of first', async () => {
    cache.set('a', 1);
    await new Promise(r => setTimeout(r, 40));
    cache.set('b', 2);
    await new Promise(r => setTimeout(r, 70));
    // 'a' should be expired (~110ms total), 'b' should still be alive (~70ms)
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
});
