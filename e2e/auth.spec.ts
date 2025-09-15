import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display welcome screen for unauthenticated users', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText('SmartSpend')).toBeVisible();
    await expect(page.getByText('Your Intelligent Financial Wellness Assistant')).toBeVisible();
    await expect(page.getByText('Get Started Free')).toBeVisible();
  });

  test('should navigate through sign up flow', async ({ page }) => {
    await page.goto('/');
    
    // Click get started
    await page.getByText('Get Started Free').click();
    
    // Should show email/password form
    await expect(page.getByText('Create your account')).toBeVisible();
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/');
    
    await page.getByText('Get Started Free').click();
    
    // Enter invalid email
    await page.getByPlaceholder('you@example.com').fill('invalid-email');
    await page.getByPlaceholder('you@example.com').blur();
    
    // Should show validation error
    await expect(page.getByText(/Invalid email format/)).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/');
    
    await page.getByText('Get Started Free').click();
    
    // Enter weak password
    await page.getByPlaceholder('Create a secure password').fill('weak');
    
    // Should show password requirements
    await expect(page.getByText('Password requirements:')).toBeVisible();
    await expect(page.getByText('At least 6 characters')).toBeVisible();
  });

  test('should switch between sign up and sign in', async ({ page }) => {
    await page.goto('/');
    
    await page.getByText('Get Started Free').click();
    
    // Switch to sign in
    await page.getByText("Already have an account? Sign in").click();
    
    await expect(page.getByText('Welcome back!')).toBeVisible();
    
    // Switch back to sign up
    await page.getByText("Don't have an account? Sign up").click();
    
    await expect(page.getByText('Create your account')).toBeVisible();
  });
});