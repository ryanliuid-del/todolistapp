import { test, expect } from '@playwright/test';

test('create, complete, filter, persist, and delete tasks', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'A fresh start.' })).toBeVisible();
  const input = page.getByRole('textbox', { name: 'New task' });
  await input.fill('   ');
  await input.press('Enter');
  await expect(page.locator('.task')).toHaveCount(0);
  for (const text of ['Plan the week', '<script>alert(1)</script>']) {
    await input.fill(text);
    await input.press('Enter');
  }
  await expect(page.locator('.task')).toHaveCount(2);
  await page.getByRole('checkbox', { name: 'Plan the week', exact: true }).check();
  await expect(page.locator('#remaining')).toHaveText('1 task left');
  await page.getByRole('button', { name: 'Active', exact: true }).click();
  await expect(page.locator('.task')).toHaveCount(1);
  await expect(page.locator('.task-text')).toHaveText('<script>alert(1)</script>');
  await page.getByRole('button', { name: 'Completed', exact: true }).click();
  await expect(page.locator('.task-text')).toHaveText('Plan the week');
  await page.reload();
  await expect(page.locator('.task')).toHaveCount(2);
  await expect(page.getByRole('checkbox', { name: 'Plan the week', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Clear completed' }).click();
  await expect(page.locator('.task')).toHaveCount(1);
  await page.getByRole('button', { name: 'Delete task: <script>alert(1)</script>', exact: true }).click();
  await expect(page.locator('.task')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.task')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('mobile layout stays within viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('textbox', { name: 'New task' }).fill('A'.repeat(300));
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await expect(page.locator('.task')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
