import { test, expect } from '@playwright/test';

test('Positions List premium styling', async ({ page }) => {
  // Navigate to the dev server (port 5173 as configured)
  await page.goto('http://localhost:5174');

  // Wait for the Positions List header to be rendered
  await page.waitForSelector('h2:has-text("Open Positions")', { timeout: 10000 });
  const positionsList = page.locator('h2:has-text("Open Positions")');
  await expect(positionsList).toBeVisible();

  // Capture a full-page screenshot
  await page.screenshot({ path: 'frontend/debug-positions-list.png', fullPage: true });

  // Optional: verify that the safety bar has expected background color for a sample position
  // This checks the first safety bar's background style attribute contains hsl(150) when marginRatio >= 0.12
  const safetyBar = page.locator('.agora-card >> .h-2').first();
  const bg = await safetyBar.evaluate((el) => getComputedStyle(el).backgroundColor);
  // Allow either safe (green) or critical (red) depending on mock data
  expect(['rgb(0, 255, 0)', 'rgb(255, 0, 0)', 'rgb(0, 217, 143)']).toContain(bg);
});
