/**
 * Flakiness: incomplete mock cleanup and race conditions with async retries.
 * Mocks are not always restored, causing interference between test cases.
 */
const { fetchWithRetry, fetchAndSort } = require('../src/fetcher');

describe('fetchWithRetry', () => {
  let originalFetch;

  beforeAll(() => {
    originalFetch = global.fetch;
  });

  // FLAKY: afterEach is missing — if one test fails mid-way, global.fetch stays mocked
  // and the next test gets the wrong mock
  afterAll(() => {
    global.fetch = originalFetch;
  });

  test('returns parsed JSON on success', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: 'Alice' }),
    });
    const result = await fetchWithRetry('https://example.com/users/1');
    expect(result).toEqual({ id: 1, name: 'Alice' });
  });

  // FLAKY: mock set up here is not cleaned up; subsequent tests see stale mock behavior
  test('retries on HTTP 500 then succeeds', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 2, name: 'Bob' }),
      });
    const result = await fetchWithRetry('https://example.com/users/2', 3);
    expect(result).toEqual({ id: 2, name: 'Bob' });
  });

  // FLAKY: if the retries test above left fetch mocked, this sees stale call counts
  test('calls fetch exactly once on first-try success', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    await fetchWithRetry('https://example.com/data');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('throws after exhausting retries', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });
    await expect(fetchWithRetry('https://example.com/fail', 2)).rejects.toThrow('HTTP 503');
  });
});

describe('fetchAndSort', () => {
  // FLAKY: if fetch is still a stale mock from prior describe block, results are wrong
  test('returns items sorted by id', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 3, val: 'c' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, val: 'a' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 2, val: 'b' }) });
    const sorted = await fetchAndSort(['url1', 'url2', 'url3']);
    expect(sorted.map(x => x.id)).toEqual([1, 2, 3]);
  });
});
