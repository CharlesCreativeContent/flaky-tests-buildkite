/**
 * Requires live network access to x.com.
 * Run on Buildkite (open egress) — will not pass in restricted sandbox environments.
 */
const { test, expect } = require('@playwright/test');

const PROFILE_URL = 'https://x.com/shawnbasquiat';
const USERNAME = 'shawnbasquiat';

test.describe('Twitter / X profile — @shawnbasquiat', () => {
  test.beforeEach(async ({ page }) => {
    // Block trackers and ads to speed up the load and reduce bot-detection surface
    await page.route('**/{ads,analytics,tracking}/**', route => route.abort());

    await page.goto(PROFILE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  });

  test('page title contains the username', async ({ page }) => {
    // X sets the title to "<Name> (@handle) / X" once the profile loads
    await page.waitForFunction(
      () => document.title.toLowerCase().includes('shawnbasquiat'),
      { timeout: 15000 }
    );
    expect(page.url()).toContain(USERNAME);
  });

  test('follower count is visible and is a valid number', async ({ page }) => {
    // The followers link href is /shawnbasquiat/verified_followers or /followers
    const followersLink = page.locator(`a[href*="/${USERNAME}/verified_followers"], a[href*="/${USERNAME}/followers"]`).first();

    await expect(followersLink).toBeVisible({ timeout: 15000 });

    const rawText = await followersLink.innerText();
    // rawText is typically "1,234\nFollowers" or "1.2K\nFollowers"
    const countLine = rawText.split('\n')[0].trim();

    console.log(`Follower count text for @${USERNAME}: "${countLine}"`);

    // Must be a non-empty string that starts with a digit or ends with K/M/B
    expect(countLine).toMatch(/^[\d,.]+[KMB]?$/i);
  });

  test('following count is visible and is a valid number', async ({ page }) => {
    const followingLink = page.locator(`a[href*="/${USERNAME}/following"]`).first();

    await expect(followingLink).toBeVisible({ timeout: 15000 });

    const rawText = await followingLink.innerText();
    const countLine = rawText.split('\n')[0].trim();

    console.log(`Following count text for @${USERNAME}: "${countLine}"`);

    expect(countLine).toMatch(/^[\d,.]+[KMB]?$/i);
  });
});
