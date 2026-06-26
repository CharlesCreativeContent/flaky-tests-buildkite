// Shared mutable state — intentionally module-level to cause cross-test pollution
let globalCount = 0;

function increment() {
  globalCount++;
  return globalCount;
}

function decrement() {
  globalCount--;
  return globalCount;
}

function getCount() {
  return globalCount;
}

function reset() {
  globalCount = 0;
}

module.exports = { increment, decrement, getCount, reset };
