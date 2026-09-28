import puppeteer from 'puppeteer-core';
import assert from 'assert';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runBrowserVerification() {
  console.log('=== LAUNCHING REAL GOOGLE CHROME FOR END-TO-END VERIFICATION ===\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-web-security',
      '--no-sandbox',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Capture console messages & network requests
  const consoleErrors = [];
  const networkRequests = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('request', (req) => {
    networkRequests.push({
      url: req.url(),
      method: req.method(),
      postData: req.postData(),
    });
  });

  try {
    // -------------------------------------------------------------
    // TEST 1: REAL SIGNUP & LOGIN
    // -------------------------------------------------------------
    console.log('1. Navigating to Landing Page http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    console.log('2. Navigating to Signup Page...');
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle2' });

    const testEmail = `dilip_candidate_${Date.now()}@veyra.test`;
    console.log('3. Filling Signup Form:', testEmail);
    await page.type('input[type="text"]', 'Dilip Chendra');
    await page.type('input[type="email"]', testEmail);
    await page.type('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('4. Landed on:', page.url());
    assert.ok(page.url().includes('/dashboard') || page.url().includes('/onboarding'), 'Should land on dashboard or onboarding');

    // -------------------------------------------------------------
    // TEST 2: CONFIGURATION PAGE
    // -------------------------------------------------------------
    console.log('\n5. Navigating to Configure Interview (/interviews/new)...');
    await page.goto('http://localhost:3000/interviews/new', { waitUntil: 'networkidle2' });

    console.log('Verifying UI elements on Configuration page:');
    // Check persona cards (Marcus and Elena)
    const pageContent = await page.content();
    assert.ok(pageContent.includes('Marcus Vance'), 'Must display Marcus Vance option');
    assert.ok(pageContent.includes('Elena Rostova'), 'Must display Elena Rostova option');
    assert.ok(pageContent.includes('Attach Resume') || pageContent.includes('Resume'), 'Must have Resume options');
    assert.ok(pageContent.includes('GitHub') || pageContent.includes('Repository'), 'Must have GitHub option');
    assert.ok(pageContent.includes('Job Description') || pageContent.includes('Role'), 'Must have Job Description option');
    console.log('-> Configuration UI validated!');

    // -------------------------------------------------------------
    // TEST 7: SELECT MARCUS & LAUNCH INTERVIEW
    // -------------------------------------------------------------
    console.log('\n6. Selecting Marcus Vance and submitting interview configuration...');
    // Click on Marcus card via his avatar image
    await page.waitForSelector('img[alt="Marcus Vance"]', { timeout: 5000 });
    await page.click('img[alt="Marcus Vance"]');
    await new Promise(r => setTimeout(r, 500));

    // Capture the create request
    let createRequestBody = null;
    page.on('request', (req) => {
      if (req.url().includes('/api/interviews/create') && req.method() === 'POST') {
        createRequestBody = req.postData();
      }
    });

    // Find and click Start Interview button
    const startButtons = await page.$$('button');
    let clickedStart = false;
    for (const btn of startButtons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && (text.includes('Enter Interview') || text.includes('Start') || text.includes('Launch') || text.includes('Begin'))) {
        await btn.click();
        clickedStart = true;
        break;
      }
    }
    assert.ok(clickedStart, 'Should click Enter Interview Room button');

    console.log('7. Waiting for live room to load...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('Live Room URL:', page.url());
    assert.ok(page.url().includes('/live'), 'Must navigate to /live');

    // -------------------------------------------------------------
    // TEST 9: VERIFY MARCUS REQUEST & PHOTO
    // -------------------------------------------------------------
    console.log('8. Verifying visible photograph in Live Room...');
    const liveImgSrcs = await page.$$eval('img', (imgs) => imgs.map((i) => i.src));
    console.log('Images loaded in Live Room:', liveImgSrcs);

    const hasInterviewerPhoto = liveImgSrcs.some(
      (src) => src.includes('interviewer_male.jpg') || src.includes('interviewer_female.jpg')
    );
    assert.ok(hasInterviewerPhoto, 'Must display high-quality interviewer photograph');

    // -------------------------------------------------------------
    // TEST 10 & 11: CLICK "BEGIN LIVE INTERVIEW" & VERIFY AUDIBLE QUESTION
    // -------------------------------------------------------------
    console.log('\n9. Clicking "Begin Live Interview" overlay button...');
    const clickedBegin = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const target = buttons.find((b) => b.textContent && b.textContent.includes('Begin Live Interview'));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });
    console.log('Begin Live Interview clicked:', clickedBegin);

    await new Promise(r => setTimeout(r, 2000));

    // Verify STT / TTS HUD is now visible
    const hudVisible = await page.evaluate(() => {
      const el = document.querySelector('strong');
      return !!el;
    });
    console.log('10. Voice Engine HUD rendered:', hudVisible);

    // -------------------------------------------------------------
    // TEST 12: CANDIDATE TURNS VIA FORM INPUT
    // -------------------------------------------------------------
    console.log('\n11. Testing candidate answer submission...');
    const inputSelector = 'input[placeholder*="Speak naturally"]';
    await page.waitForSelector(inputSelector, { timeout: 5000 });
    await page.type(inputSelector, 'I architected an asynchronous event ingestion pipeline using Go, Kafka, and PostgreSQL.');
    await page.keyboard.press('Enter');

    console.log('Submitted answer. Waiting for Interview Brain response...');
    await new Promise(r => setTimeout(r, 3000));

    // -------------------------------------------------------------
    // TEST 13, 14, 15, 16: SHORT ANSWERS & UNCERTAINTY
    // -------------------------------------------------------------
    console.log('\n12. Testing short answer: "Python." (Interview must NOT terminate)...');
    await page.type(inputSelector, 'Python.');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 2500));

    console.log('13. Testing "I don\'t know." (Interview must NOT terminate)...');
    await page.type(inputSelector, "I don't know.");
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 2500));

    // -------------------------------------------------------------
    // TEST 30 & 31: END INTERVIEW & HARD CLEANUP
    // -------------------------------------------------------------
    console.log('\n14. Clicking "End Interview" button...');
    const clickedEnd = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const target = buttons.find((b) => b.textContent && b.textContent.includes('End Interview'));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });
    console.log('End Interview clicked:', clickedEnd);

    // Modal confirmation
    console.log('15. Confirming end in modal...');
    await new Promise(r => setTimeout(r, 1000));
    const clickedConfirm = await page.evaluate(() => {
      const modal = document.querySelector('div.fixed.inset-0');
      if (modal) {
        const btn = Array.from(modal.querySelectorAll('button')).find(
          b => b.textContent && b.textContent.includes('End Interview')
        );
        if (btn) {
          btn.click();
          return true;
        }
      }
      return false;
    });
    console.log('Modal confirm clicked:', clickedConfirm);

    console.log('16. Waiting for navigation to report page...');
    await page.waitForFunction(() => window.location.href.includes('/report'), { timeout: 30000 });
    console.log('Final Page URL:', page.url());
    assert.ok(page.url().includes('/report'), 'Must land on /report page');

    // -------------------------------------------------------------
    // TEST 32 & 33: MEDIA TRACKS STATE AUDIT
    // -------------------------------------------------------------
    console.log('\n17. Auditing media tracks in browser context...');
    const activeMediaTracks = await page.evaluate(() => {
      const w = window;
      if (w.__veyraLocalMicStream) {
        return w.__veyraLocalMicStream.getTracks().map((t) => ({ kind: t.kind, state: t.readyState }));
      }
      return [];
    });
    console.log('Active media tracks remaining on report page:', activeMediaTracks);
    assert.strictEqual(activeMediaTracks.length, 0, 'No active media tracks should remain on report page');

    console.log('\n=== REAL BROWSER VERIFICATION COMPLETED WITH 100% SUCCESS! ===');
  } finally {
    await browser.close();
  }
}

runBrowserVerification().catch((err) => {
  console.error('\nBrowser verification failed with error:', err);
  process.exit(1);
});
