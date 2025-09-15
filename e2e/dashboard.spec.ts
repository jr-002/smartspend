import { test, expect } from '@playwright/test';

// Mock authentication for testing
test.beforeEach(async ({ page }) => {
  // Mock Supabase auth state
  await page.addInitScript(() => {
    // Mock localStorage for auth
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      user: {
        id: 'test-user-id',
        email: 'test@example.com'
      }
    }));
  });
});

test.describe('Dashboard Functionality', () => {
  test('should load dashboard for authenticated users', async ({ page }) => {
    await page.goto('/');
    
    // Should show dashboard instead of welcome screen
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Overview of your financial health')).toBeVisible();
  });

  test('should navigate between different sections', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to budgeting
    await page.getByText('Budgeting').click();
    await expect(page.getByText('Smart Budgeting')).toBeVisible();
    
    // Navigate to transactions
    await page.getByText('Transactions').click();
    await expect(page.getByText('Transaction History')).toBeVisible();
    
    // Navigate to savings goals
    await page.getByText('Savings Goals').click();
    await expect(page.getByText('Set and track your financial goals')).toBeVisible();
  });

  test('should display user profile information', async ({ page }) => {
    await page.goto('/');
    
    // Should show user info in header
    await expect(page.getByText('test@example.com')).toBeVisible();
    await expect(page.getByText('Sign Out')).toBeVisible();
  });

  test('should handle theme switching', async ({ page }) => {
    await page.goto('/');
    
    // Click theme toggle
    await page.getByRole('button', { name: /toggle theme/i }).click();
    
    // Should show theme options
    await expect(page.getByText('Light')).toBeVisible();
    await expect(page.getByText('Dark')).toBeVisible();
    await expect(page.getByText('System')).toBeVisible();
  });

  test('should handle sidebar collapse/expand', async ({ page }) => {
    await page.goto('/');
    
    // Find and click sidebar trigger (only visible on mobile/tablet)
    const sidebarTrigger = page.getByRole('button', { name: /toggle sidebar/i });
    
    if (await sidebarTrigger.isVisible()) {
      await sidebarTrigger.click();
      // Sidebar behavior would be tested here
    }
  });
});