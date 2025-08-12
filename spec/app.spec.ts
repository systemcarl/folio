import { test, expect } from '@playwright/test';

test.describe('app', () => {
  test('returns HTML', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.headers()?.['content-type']).toBe('text/html');
    expect(await response?.text()).toContain('<!doctype html>');
  });

  test('returns HTML with default theme classes', async ({ page }) => {
    await page.goto('/');

    const html = await page.locator('html').elementHandle();
    const htmlClass = await html?.getAttribute('class');
    expect(htmlClass).toContain('theme-default');

    const body = await page.locator('body').elementHandle();
    const bodyClass = await body?.getAttribute('class');
    expect(bodyClass).toContain('section-default');
  });

  test('renders HTML with client theme classes', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'test'));

    await page.goto('/');

    const html = await page.locator('html').elementHandle();
    const htmlClass = await html?.getAttribute('class');
    expect(htmlClass).toContain('theme-test');
  });

  test('updates HTML when client theme changes', async ({ page }) => {
    await page.goto('/');
    const html = await page.locator('html').elementHandle();

    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent(
        'themeUpdated',
        { detail : 'test' },
      ));
    });

    const htmlClass = await html?.getAttribute('class');
    expect(htmlClass).toContain('theme-test');
  });
});
