import { test, expect } from '@playwright/test';

// Mock authentication for testing
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
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

test.describe('Financial Operations', () => {
  test('should add a new transaction', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to transactions
    await page.getByText('Transactions').click();
    
    // Click add transaction
    await page.getByText('Add Transaction').click();
    
    // Fill out form
    await page.getByPlaceholder('Description').fill('Test Transaction');
    await page.getByRole('spinbutton').fill('100');
    await page.getByPlaceholder('Category').fill('Food');
    
    // Submit form
    await page.getByText('Add Transaction').last().click();
    
    // Should show success message or updated list
    await expect(page.getByText('Test Transaction')).toBeVisible();
  });

  test('should create a budget', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to budgeting
    await page.getByText('Budgeting').click();
    
    // Click create budget
    await page.getByText('Create Budget').click();
    
    // Fill out form
    await page.getByPlaceholder('e.g., Food, Transportation').fill('Food');
    await page.getByRole('spinbutton').fill('500');
    
    // Submit form
    await page.getByText('Create Budget').last().click();
    
    // Should show success or updated budget list
    await expect(page.getByText('Food')).toBeVisible();
  });

  test('should create a savings goal', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to savings goals
    await page.getByText('Savings Goals').click();
    
    // Click create goal
    await page.getByText('Create Goal').click();
    
    // Fill out form
    await page.getByPlaceholder('e.g., Emergency Fund').fill('Vacation Fund');
    await page.getByRole('spinbutton').first().fill('5000');
    
    // Submit form
    await page.getByText('Create Goal').last().click();
    
    // Should show success or updated goals list
    await expect(page.getByText('Vacation Fund')).toBeVisible();
  });

  test('should handle AI insights generation', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to AI insights
    await page.getByText('AI Insights').click();
    
    // Click generate insights
    await page.getByText('Generate Insights').click();
    
    // Should show loading state
    await expect(page.getByText('Generating...')).toBeVisible();
    
    // Should eventually show insights or fallback message
    await expect(page.getByText(/insight/i)).toBeVisible({ timeout: 10000 });
  });

  test('should handle error states gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to a section that might have errors
    await page.getByText('AI Coach').click();
    
    // Try to send a message
    await page.getByPlaceholder('Ask me anything about your finances...').fill('Test question');
    await page.getByRole('button', { name: /send/i }).click();
    
    // Should handle the response (either success or graceful error)
    await expect(page.getByText(/test question/i)).toBeVisible();
  });
});