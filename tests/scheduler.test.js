const Scheduler = require('../src/scheduler');

describe('Scheduler', () => {
  let scheduler;

  beforeEach(() => {
    jest.useFakeTimers();
    scheduler = new Scheduler();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('schedule adds a pending job', () => {
    const id = scheduler.schedule('job1', () => {}, 1000);
    expect(scheduler.pendingCount()).toBe(1);
    scheduler.cancel(id);
  });

  test('cancel removes a job', () => {
    const id = scheduler.schedule('job2', () => {}, 5000);
    scheduler.cancel(id);
    expect(scheduler.pendingCount()).toBe(0);
  });

  test('job fires after delay', () => {
    let fired = false;
    scheduler.schedule('fireJob', () => { fired = true; }, 500);
    expect(fired).toBe(false);
    jest.advanceTimersByTime(500);
    expect(fired).toBe(true);
  });

  test('pending count decrements after job fires', () => {
    scheduler.schedule('cleanup', () => {}, 300);
    expect(scheduler.pendingCount()).toBe(1);
    jest.advanceTimersByTime(300);
    expect(scheduler.pendingCount()).toBe(0);
  });

  test('multiple jobs can be scheduled independently', () => {
    const results = [];
    scheduler.schedule('a', () => results.push('a'), 100);
    scheduler.schedule('b', () => results.push('b'), 200);
    expect(scheduler.pendingCount()).toBe(2);
    jest.advanceTimersByTime(150);
    expect(results).toEqual(['a']);
    expect(scheduler.pendingCount()).toBe(1);
    jest.advanceTimersByTime(100);
    expect(results).toEqual(['a', 'b']);
    expect(scheduler.pendingCount()).toBe(0);
  });

  test('cancelled job does not fire', () => {
    let fired = false;
    const id = scheduler.schedule('noop', () => { fired = true; }, 200);
    scheduler.cancel(id);
    jest.advanceTimersByTime(500);
    expect(fired).toBe(false);
  });

  test('job callback receives no arguments', () => {
    const cb = jest.fn();
    scheduler.schedule('cb', cb, 100);
    jest.advanceTimersByTime(100);
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
