import puppeteer from 'puppeteer-core';
import assert from 'node:assert';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testForgotPassword() {
  console.log('--- STARTING FORGOT PASSWORD E2E TEST ---');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-web-security'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  try {
    // 1. Visit Login page
    console.log('1. Navigating to http://localhost:3000/login ...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });

    // Verify "Forgot password?" link exists
    const forgotLink = await page.$('a[href*="/forgot-password"]');
    assert.ok(forgotLink, 'Forgot password link must exist on login page');
    console.log('Forgot password link found on login page!');

    // 2. Test invalid login to verify contextual error link
    console.log('2. Testing invalid login with dilip.madagari@gmail.com to check contextual alert...');
    await page.type('input[type="email"]', 'dilip.madagari@gmail.com');
    await page.type('input[type="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    await page.waitForSelector('.bg-rose-950\\/70', { timeout: 5000 });
    const errorText = await page.$eval('.bg-rose-950\\/70', el => el.textContent);
    console.log('Error alert displayed:', errorText);
    assert.ok(errorText.includes('Reset your password here'), 'Must offer password reset link in error alert');

    await page.screenshot({ path: 'tests/qa_login_with_forgot_password.png' });

    // 3. Click the Reset link in the alert
    console.log('3. Clicking reset password link...');
    const resetLinkInAlert = await page.$('.bg-rose-950\\/70 a[href*="/forgot-password"]');
    await resetLinkInAlert.click();

    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    console.log('Current URL:', page.url());
    assert.ok(page.url().includes('/forgot-password'), 'Must navigate to /forgot-password');

    // 4. Verify pre-filled email and submit Step 1
    const prefilledEmail = await page.$eval('input[type="email"]', el => el.value);
    console.log('Prefilled email on forgot-password page:', prefilledEmail);
    assert.strictEqual(prefilledEmail, 'dilip.madagari@gmail.com');

    await page.screenshot({ path: 'tests/qa_forgot_password_step1.png' });

    console.log('4. Submitting email to generate recovery code...');
    await page.click('button[type="submit"]');

    // 5. Wait for Step 2
    await page.waitForSelector('input[placeholder="123456"]', { timeout: 10000 });
    console.log('Step 2 reached: verification code requested!');

    const generatedCode = await page.$eval('input[placeholder="123456"]', el => el.value);
    console.log('Auto-filled verification code:', generatedCode);
    assert.ok(generatedCode.length === 6, 'Verification code must be 6 digits');

    // Fill in new password
    console.log('5. Entering new password...');
    const newPass = 'DilipVeyra2026!';
    const passwordInputs = await page.$$('input[type="password"]');
    await passwordInputs[0].type(newPass);
    await passwordInputs[1].type(newPass);

    await page.screenshot({ path: 'tests/qa_forgot_password_step2.png' });

    // Submit Step 2
    console.log('6. Submitting new password...');
    await page.click('button[type="submit"]');

    // 6. Wait for Step 3 Success
    await page.waitForFunction(() => document.body.textContent.includes('Password Updated'), { timeout: 10000 });
    console.log('Step 3 reached: Password reset successful!');
    await page.screenshot({ path: 'tests/qa_forgot_password_step3_success.png' });

    // 7. Verify logging in with the new password
    console.log('7. Navigating to login and verifying new password...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await page.type('input[type="email"]', 'dilip.madagari@gmail.com');
    await page.type('input[type="password"]', newPass);
    await page.click('button[type="submit"]');

    await page.waitForFunction(() => window.location.pathname === '/dashboard', { timeout: 10000 });
    console.log('Post-login URL:', page.url());
    assert.ok(page.url().includes('/dashboard'), 'User must be redirected to /dashboard on successful login');

    await page.screenshot({ path: 'tests/qa_login_success_after_reset.png' });

    console.log('\n======================================================');
    console.log('FORGOT PASSWORD FUNCTIONALITY VERIFIED 100% WORKING!');
    console.log('======================================================');
  } finally {
    await browser.close();
  }
}

testForgotPassword().catch(err => {
  console.error('FORGOT PASSWORD TEST FAILED:', err);
  process.exit(1);
});
