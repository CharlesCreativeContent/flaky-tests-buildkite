const { fetchWithRetry, fetchAndSort } = require('../src/fetcher');

const makeResponse = (data) => ({
  ok: true,
  json: async () => data,
});

const makeErrorResponse = (status) => ({
  ok: false,
  status,
});

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

describe('fetchWithRetry', () => {
  test('returns parsed JSON on success', async () => {
    global.fetch.mockResolvedValueOnce(makeResponse({ id: 1, name: 'Alice' }));
    const result = await fetchWithRetry('https://example.com/users/1');
    expect(result).toEqual({ id: 1, name: 'Alice' });
  });

  test('calls fetch exactly once on first-try success', async () => {
    global.fetch.mockResolvedValueOnce(makeResponse({}));
    await fetchWithRetry('https://example.com/data');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('retries on HTTP 500 and succeeds on third attempt', async () => {
    global.fetch
      .mockResolvedValueOnce(makeErrorResponse(500))
      .mockResolvedValueOnce(makeErrorResponse(500))
      .mockResolvedValueOnce(makeResponse({ id: 2 }));
    const result = await fetchWithRetry('https://example.com/users/2', 3);
    expect(result).toEqual({ id: 2 });
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  test('throws after exhausting all retries', async () => {
    global.fetch.mockResolvedValue(makeErrorResponse(503));
    await expect(fetchWithRetry('https://example.com/fail', 2)).rejects.toThrow('HTTP 503');
  });

  test('passes the URL to fetch', async () => {
    global.fetch.mockResolvedValueOnce(makeResponse({}));
    await fetchWithRetry('https://example.com/target');
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/target');
  });
});

describe('fetchAndSort', () => {
  test('returns items sorted ascending by id', async () => {
    global.fetch
      .mockResolvedValueOnce(makeResponse({ id: 3, val: 'c' }))
      .mockResolvedValueOnce(makeResponse({ id: 1, val: 'a' }))
      .mockResolvedValueOnce(makeResponse({ id: 2, val: 'b' }));
    const sorted = await fetchAndSort(['url1', 'url2', 'url3']);
    expect(sorted.map(x => x.id)).toEqual([1, 2, 3]);
  });

  test('returns a single item unwrapped in an array', async () => {
    global.fetch.mockResolvedValueOnce(makeResponse({ id: 5 }));
    const result = await fetchAndSort(['url1']);
    expect(result).toEqual([{ id: 5 }]);
  });
});
