const { defineConfig, devices } = require('@playwright/test');

// In CI (Buildkite Playwright image) browsers live at /ms-playwright.
// Locally with the pre-installed sandbox browser they live at /opt/pw-browsers.
// When neither env var is set, let Playwright find its own default.
const executablePath =
  process.env.PLAYWRIGHT_BROWSERS_PATH === '/ms-playwright'
    ? undefined // official image — Playwright resolves the path itself
    : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

module.exports = defineConfig({
  testDir: './tests/playwright',
  timeout: 30000,
  retries: 1,
  reporter: [['list']],
  use: {
    headless: true,
    launchOptions: {
      executablePath,
    },
    // Realistic UA to reduce bot-detection rejections
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
