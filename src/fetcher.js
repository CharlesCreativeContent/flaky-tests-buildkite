// Simulates an HTTP fetch with retry logic
async function fetchWithRetry(url, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) throw err;
      await new Promise(r => setTimeout(r, 100 * attempt));
    }
  }
}

// Returns data sorted by id — but only if input arrives in time
async function fetchAndSort(urls) {
  const results = await Promise.all(urls.map(u => fetchWithRetry(u)));
  return results.sort((a, b) => a.id - b.id);
}

module.exports = { fetchWithRetry, fetchAndSort };
