# flaky-tests-buildkite

A Node.js Jest test suite integrated with [Buildkite Test Analytics](https://buildkite.com/test-analytics).

## What's inside

| File | What it tests |
|---|---|
| `tests/cache.test.js` | TTL-based cache — uses fake timers for deterministic expiry |
| `tests/queue.test.js` | Async queue — mocks `Math.random` to eliminate non-deterministic delays |
| `tests/counter.test.js` | Shared counter module — proper `reset()` in `beforeEach` across all suites |
| `tests/fetcher.test.js` | HTTP fetch with retry — full mock setup/teardown per test |
| `tests/scheduler.test.js` | Timer-based scheduler — fake timers throughout for reliable control |
| `tests/random.test.js` | Controlled randomness — demonstrates mocking `Math.random` and `Date.now` |

## Running locally

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with verbose output
npm run test:verbose

# Run in watch mode
npm run test:watch

# Run in CI mode (what Buildkite uses)
npm run test:ci
```

## Setting up Buildkite

### 1. Create a Buildkite pipeline

1. In your Buildkite org, go to **New Pipeline** and connect this repository.
2. Set **Pipeline file path** to `.buildkite/pipeline.yml`.

### 2. Enable Test Analytics

1. In Buildkite, open **Test Analytics** → **New test suite**.
2. Select **Jest** as the framework and copy the API token.
3. Add the token as a pipeline environment variable or secret:

```
BUILDKITE_ANALYTICS_TOKEN=<your-token>
```

### 3. Run a build

Push a commit or trigger a build manually. The pipeline runs the full test suite **3 times in parallel**, each uploading results directly to Test Analytics via the `buildkite-test-collector` Jest reporter. No artifact upload steps needed.

### 4. View results in Test Analytics

Go to **Test Analytics → your suite** to see test run history, duration trends, and reliability scores across builds.

## Pipeline structure

```
┌─────────────────────────────┐
│  Run tests (1/3) → upload   │
│  Run tests (2/3) → upload   │  ← all 3 run in parallel
│  Run tests (3/3) → upload   │
└─────────────────────────────┘
```

Each step runs `npm ci && npm run test:ci` inside `node:20-alpine` so it is fully self-contained — no shared install step that would be lost between Docker containers.

## How the Test Analytics reporter works

`buildkite-test-collector` is registered as a Jest reporter in `package.json`:

```json
"reporters": [
  "default",
  "buildkite-test-collector/jest/reporter"
]
```

When `BUILDKITE_ANALYTICS_TOKEN` is set, it streams results to the API after each run. Without the token (local dev), it prints `Missing BUILDKITE_ANALYTICS_TOKEN` and exits cleanly.
