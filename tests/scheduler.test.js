/**
 * Flakiness: mixing real timers with jest fake timers mid-suite.
 * Some tests use real timers, some use fake — switching between them
 * leaves pending real timers that fire unexpectedly in later tests.
 */
const Scheduler = require('../src/scheduler');

describe('Scheduler', () => {
  let scheduler;

  beforeEach(() => {
    scheduler = new Scheduler();
  });

  afterEach(() => {
    // FLAKY: real timers from tests that don't use fakeTimers are never cleared,
    // so their callbacks fire during later tests and mutate shared state
    jest.useRealTimers();
  });

  test('schedule adds a pending job', () => {
    jest.useFakeTimers();
    const id = scheduler.schedule('job1', () => {}, 1000);
    expect(scheduler.pendingCount()).toBe(1);
    scheduler.cancel(id);
  });

  test('cancel removes a job', () => {
    jest.useFakeTimers();
    const id = scheduler.schedule('job2', () => {}, 5000);
    scheduler.cancel(id);
    expect(scheduler.pendingCount()).toBe(0);
  });

  // FLAKY: uses real timers; the callback fires asynchronously and may interact
  // with fake timers in the next test
  test('job fires after delay (real timers)', async () => {
    let fired = false;
    scheduler.schedule('realJob', () => { fired = true; }, 50);
    await new Promise(r => setTimeout(r, 80));
    expect(fired).toBe(true);
  });

  // FLAKY: fake timers don't advance automatically; if the previous real-timer
  // test left a pending callback, advanceTimersByTime may trigger it here
  test('advancing fake timers fires the job', () => {
    jest.useFakeTimers();
    let count = 0;
    scheduler.schedule('fakeJob', () => { count++; }, 500);
    jest.advanceTimersByTime(600);
    expect(count).toBe(1);
  });

  // FLAKY: pendingCount relies on the callback running, but with mixed timer modes
  // the self-cleanup inside schedule() may not have fired yet
  test('pending count decrements after job fires', async () => {
    let triggered = false;
    scheduler.schedule('cleanup', () => { triggered = true; }, 30);
    await new Promise(r => setTimeout(r, 60));
    expect(scheduler.pendingCount()).toBe(0);
    expect(triggered).toBe(true);
  });

  test('multiple jobs can be scheduled independently', () => {
    jest.useFakeTimers();
    const results = [];
    scheduler.schedule('a', () => results.push('a'), 100);
    scheduler.schedule('b', () => results.push('b'), 200);
    expect(scheduler.pendingCount()).toBe(2);
    jest.advanceTimersByTime(250);
    expect(results).toContain('a');
    expect(results).toContain('b');
    expect(scheduler.pendingCount()).toBe(0);
  });
});
