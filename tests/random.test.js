describe('Controlled randomness and time', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('mocked Math.random returns the configured value', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.42);
    expect(Math.random()).toBe(0.42);
  });

  test('average of mocked randoms equals the mock value', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const samples = Array.from({ length: 10 }, () => Math.random());
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(avg).toBe(0.5);
  });

  test('Date.now mock returns a stable timestamp', () => {
    const fixedTime = 1_700_000_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(fixedTime);
    expect(Date.now()).toBe(fixedTime);
    expect(Date.now()).toBe(fixedTime);
  });

  test('two mocked Date.now calls are always equal', () => {
    jest.spyOn(Date, 'now').mockReturnValue(9999);
    const t1 = Date.now();
    const t2 = Date.now();
    expect(t2 - t1).toBe(0);
  });

  test('selecting from a list with a controlled index is deterministic', () => {
    const items = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
    jest.spyOn(Math, 'random').mockReturnValue(0.6);
    const idx = Math.floor(Math.random() * items.length);
    expect(items[idx]).toBe('date');
  });

  test('shuffled array contains all original elements', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const original = [1, 2, 3, 4, 5, 6];
    const shuffled = [...original].sort(() => Math.random() - 0.5);
    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.sort((a, b) => a - b)).toEqual(original);
  });

  test('Math.random mock can simulate a sequence', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0.5);
    expect(Math.random()).toBe(0.1);
    expect(Math.random()).toBe(0.9);
    expect(Math.random()).toBe(0.5);
  });
});
