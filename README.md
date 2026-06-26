# flaky-tests-buildkite

A Node.js test suite designed to demonstrate flaky test detection with [Buildkite Test Analytics](https://buildkite.com/test-analytics).

## What's inside

| File | Flakiness pattern |
|---|---|
| `tests/cache.test.js` | **Timing** — TTL expiry tested at boundary values; fails under system load |
| `tests/queue.test.js` | **Non-deterministic async ordering** — random per-item delays break order assertions |
| `tests/counter.test.js` | **Shared mutable state** — module-level global pollutes tests across suites |
| `tests/fetcher.test.js` | **Incomplete mock teardown** — stale `global.fetch` mock bleeds between tests |
| `tests/scheduler.test.js` | **Mixed timer modes** — real and fake timers interleave, causing phantom callbacks |
| `tests/random.test.js` | **Uncontrolled randomness / date sensitivity** — Math.random() and Date.now() without mocking |

## Running locally

```bash
# Install dependencies
npm install

# Run all tests (output to terminal)
npm test

# Run with verbose output (recommended for seeing which tests are flaky)
npm run test:verbose

# Run in watch mode
npm run test:watch

# Run multiple times to observe flakiness
for i in 1 2 3 4 5; do echo "=== Run $i ===" && npm test 2>&1 | tail -5; done
```

## Setting up Buildkite

### 1. Create a Buildkite pipeline

1. In your Buildkite org, go to **New Pipeline** and connect this repository.
2. Set **Pipeline file path** to `.buildkite/pipeline.yml`.

### 2. Enable Test Analytics

1. In Buildkite, open **Test Analytics** → **New test suite**.
2. Select **Jest** as the framework and copy the API token.
3. Add the token as a pipeline environment variable (or secret):

```
BUILDKITE_ANALYTICS_TOKEN=<your-token>
```

### 3. Configure the agent

The pipeline uses the `docker` plugin with `node:20-alpine`. Your Buildkite agent must have Docker available. If you're using hosted agents this works out of the box.

### 4. Run a build

Push a commit or trigger a build manually. The pipeline:

1. **Installs** dependencies
2. **Runs the test suite three times in parallel** — each run uploads a JUnit XML report to Test Analytics
3. **Prints a flakiness summary** comparing failures across runs

### 5. View results in Test Analytics

After a few builds, go to **Test Analytics → your suite → Flaky tests**. Tests that pass in some runs and fail in others are automatically flagged as flaky.

## Pipeline structure

```
Install deps
    │
    ├── Run tests (attempt 1) ──→ Upload JUnit XML
    ├── Run tests (attempt 2) ──→ Upload JUnit XML
    └── Run tests (attempt 3) ──→ Upload JUnit XML
              │
         Flakiness summary (runs even if tests fail)
```

## Why these tests are flaky

| Pattern | Root cause | How to fix |
|---|---|---|
| Timing | Hard-coded sleep durations at TTL boundaries | Use jest fake timers or wider margins |
| Async ordering | `Math.random()` in production code path | Mock `Math.random` or don't assert on order |
| Shared state | Module-level mutable variable | Reset in `beforeEach`; or use dependency injection |
| Mock teardown | Missing `afterEach(() => jest.restoreAllMocks())` | Add proper teardown to every describe block |
| Mixed timers | Alternating `useFakeTimers` / `useRealTimers` | Pick one mode per describe block and stick to it |
| Uncontrolled random | Raw `Math.random()` / `Date.now()` in assertions | Spy and mock before the test; restore after |
