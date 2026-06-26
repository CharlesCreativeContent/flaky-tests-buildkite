/**
 * Flakiness: shared module-level state.
 * The counter module keeps a global variable. Tests that don't reset it
 * pass when run in isolation but fail when run in a suite (order-dependent).
 */
const { increment, decrement, getCount, reset } = require('../src/counter');

describe('Counter - Suite A', () => {
  // FLAKY: assumes count starts at 0, but prior suite may have left it dirty
  test('increment returns 1 from zero', () => {
    expect(increment()).toBe(1);
  });

  // FLAKY: depends on the test above having run first and nothing else in between
  test('increment twice returns 2', () => {
    increment();
    expect(getCount()).toBe(2);
  });

  test('decrement reduces count', () => {
    reset();
    increment();
    increment();
    decrement();
    expect(getCount()).toBe(1);
  });
});

describe('Counter - Suite B', () => {
  beforeEach(() => {
    reset();
  });

  test('starts at 0 after reset', () => {
    expect(getCount()).toBe(0);
  });

  test('returns correct count after multiple increments', () => {
    increment();
    increment();
    increment();
    expect(getCount()).toBe(3);
  });

  // FLAKY: this test does NOT reset, so the next describe block picks up dirty state
  test('leaves state dirty intentionally', () => {
    increment();
    increment();
    expect(getCount()).toBe(2);
    // Deliberately skips reset to pollute the next suite
  });
});

describe('Counter - Suite C (inherits dirty state)', () => {
  // FLAKY: expects 0 but Suite B's last test left count at 2
  test('count is 0 at start of new suite', () => {
    expect(getCount()).toBe(0);
  });

  // FLAKY: same issue — depends on run order relative to Suite B
  test('first increment in suite returns 1', () => {
    expect(increment()).toBe(1);
  });
});
