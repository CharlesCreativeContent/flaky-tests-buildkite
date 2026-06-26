const { increment, decrement, getCount, reset } = require('../src/counter');

beforeEach(() => {
  reset();
});

describe('Counter - increment', () => {
  test('returns 1 from zero', () => {
    expect(increment()).toBe(1);
  });

  test('increments on successive calls', () => {
    increment();
    increment();
    expect(getCount()).toBe(2);
  });

  test('returns the new count each time', () => {
    expect(increment()).toBe(1);
    expect(increment()).toBe(2);
    expect(increment()).toBe(3);
  });
});

describe('Counter - decrement', () => {
  test('reduces count by 1', () => {
    increment();
    increment();
    decrement();
    expect(getCount()).toBe(1);
  });

  test('can go below zero', () => {
    expect(decrement()).toBe(-1);
  });
});

describe('Counter - getCount', () => {
  test('returns 0 after reset', () => {
    increment();
    reset();
    expect(getCount()).toBe(0);
  });

  test('reflects all operations', () => {
    increment();
    increment();
    increment();
    decrement();
    expect(getCount()).toBe(2);
  });
});

describe('Counter - reset', () => {
  test('sets count back to 0', () => {
    increment();
    increment();
    reset();
    expect(getCount()).toBe(0);
  });

  test('is safe to call multiple times', () => {
    reset();
    reset();
    expect(getCount()).toBe(0);
  });
});
