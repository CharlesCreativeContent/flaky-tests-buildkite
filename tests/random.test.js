/**
 * Flakiness: Math.random() and Date.now() usage without seeding or mocking.
 * These tests depend on values that differ on every run.
 */

describe('Random and date-sensitive logic', () => {
  // FLAKY: passes ~70% of the time (when random < 0.7)
  test('random value is below threshold', () => {
    const value = Math.random();
    expect(value).toBeLessThan(0.7);
  });

  // FLAKY: the sum of 10 randoms is almost never exactly 5.0
  test('average of randoms approximates 0.5', () => {
    const samples = Array.from({ length: 10 }, () => Math.random());
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    // Tight tolerance — fails frequently under natural variance
    expect(avg).toBeGreaterThan(0.35);
    expect(avg).toBeLessThan(0.65);
  });

  // FLAKY: passes only if the test runs during a specific second window
  test('timestamps generated close together are equal at second resolution', () => {
    const t1 = Math.floor(Date.now() / 1000);
    // Intentional tiny sync work that may cross a second boundary
    let x = 0;
    for (let i = 0; i < 1e7; i++) x += i;
    const t2 = Math.floor(Date.now() / 1000);
    expect(t1).toBe(t2);
  });

  // FLAKY: picks a random index; element may or may not satisfy the predicate
  test('random item from list passes validation', () => {
    const items = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape'];
    const idx = Math.floor(Math.random() * items.length);
    const picked = items[idx];
    // Only passes for fruits longer than 4 chars (~5/7 ≈ 71%)
    expect(picked.length).toBeGreaterThan(4);
  });

  // FLAKY: random shuffle — order matches original only ~17% of the time (1/6!)
  test('shuffled array preserves all elements but not order', () => {
    const original = [1, 2, 3, 4, 5, 6];
    const shuffled = [...original].sort(() => Math.random() - 0.5);
    // The real assertion (element equality) is stable; the order check is flaky
    expect(shuffled).toHaveLength(original.length);
    expect(shuffled).toEqual(original); // FLAKY: fails when shuffle actually shuffles
  });

  // FLAKY: relies on two separate Date.now() calls being within 1ms of each other
  test('two consecutive Date.now() calls are within 1ms', () => {
    const t1 = Date.now();
    const t2 = Date.now();
    expect(t2 - t1).toBeLessThanOrEqual(1);
  });
});
