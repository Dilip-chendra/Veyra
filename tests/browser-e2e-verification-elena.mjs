import puppeteer from 'puppeteer-core';
import assert from 'node:assert';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:3000';

async function runElenaBrowserVerification() {
  console.log('=== LAUNCHING REAL GOOGLE CHROME FOR ELENA ROSTOVA VERIFICATION ===\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--autoplay-policy=no-user-gesture-required',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // -------------------------------------------------------------
    // SIGNUP NEW UNIQUE USER
    // -------------------------------------------------------------
    const testEmail = `dilip_elena_${Date.now()}@veyra.test`;
    console.log(`1. Signing up candidate: ${testEmail}...`);
    await page.goto(`${APP_URL}/signup`, { waitUntil: 'networkidle2' });
    await page.type('input[type="text"]', 'Elena Candidate');
    await page.type('input[type="email"]', testEmail);
    await page.type('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('2. Landed on:', page.url());

    // -------------------------------------------------------------
    // CONFIGURE INTERVIEW WITH ELENA ROSTOVA
    // -------------------------------------------------------------
    console.log('3. Navigating to /interviews/new...');
    await page.goto(`${APP_URL}/interviews/new`, { waitUntil: 'networkidle2' });

    console.log('4. Selecting Elena Rostova persona card...');
    const clickedElena = await page.evaluate(() => {
      const img = document.querySelector('img[alt="Elena Rostova"]');
      if (img) {
        const card = img.closest('.cursor-pointer') || img.parentElement;
        if (card) {
          card.click();
          return true;
        }
      }
      return false;
    });
    assert.ok(clickedElena, 'Must be able to click Elena Rostova card');

    let createRequestBody = null;
    page.on('request', (req) => {
      if (req.url().includes('/api/interviews/create') && req.method() === 'POST') {
        createRequestBody = req.postData();
      }
    });

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

    console.log('5. Waiting for live room to load...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('Live Room URL:', page.url());
    assert.ok(page.url().includes('/live'), 'Must navigate to /live');

    // Verify create payload was female
    if (createRequestBody) {
      const parsed = JSON.parse(createRequestBody);
      console.log('Create Interview Payload gender:', parsed.gender);
      assert.strictEqual(parsed.gender, 'female', 'Selected gender must be female');
    }

    // -------------------------------------------------------------
    // VERIFY ELENA'S PHOTO IN LIVE ROOM
    // -------------------------------------------------------------
    console.log('6. Verifying visible photograph in Live Room...');
    const liveImgSrcs = await page.$$eval('img', (imgs) => imgs.map((i) => i.src));
    console.log('Images loaded in Live Room:', liveImgSrcs);

    const hasElenaPhoto = liveImgSrcs.some((src) => src.includes('interviewer_female.jpg'));
    const hasMarcusPhoto = liveImgSrcs.some((src) => src.includes('interviewer_male.jpg'));
    assert.ok(hasElenaPhoto, 'Must display Elena Rostova photograph (interviewer_female.jpg)');
    assert.strictEqual(hasMarcusPhoto, false, 'Must NOT display Marcus Vance photo when Elena is selected');

    // -------------------------------------------------------------
    // BEGIN INTERVIEW & VERIFY CARTESIA TTS WITH ELENA'S VOICE
    // -------------------------------------------------------------
    console.log('\n7. Clicking "Begin Live Interview" overlay button...');
    let ttsRequestGender = null;
    page.on('request', (req) => {
      if (req.url().includes('/api/cartesia/tts') && req.method() === 'POST') {
        try {
          const body = JSON.parse(req.postData() || '{}');
          if (body.gender) {
            ttsRequestGender = body.gender;
          }
        } catch (_) {}
      }
    });

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

    await new Promise((r) => setTimeout(r, 4000));
    console.log('Elena TTS Gender requested:', ttsRequestGender);
    assert.strictEqual(
      ttsRequestGender,
      'female',
      "Elena's voice synthesis request must specify gender 'female' (Morgan Executive Expert voice)"
    );

    // -------------------------------------------------------------
    // TEST TURNS & SHORT ANSWERS WITH ELENA
    // -------------------------------------------------------------
    console.log('\n8. Testing candidate turn with Elena...');
    const inputSelector = 'input[placeholder*="Speak naturally"]';
    await page.waitForSelector(inputSelector);
    await page.type(inputSelector, 'I structure high-throughput systems with asynchronous queues and partitioned worker pools.');
    await page.keyboard.press('Enter');
    await new Promise((r) => setTimeout(r, 3000));

    console.log('9. Testing short answer: "Yes." (Must NOT terminate)...');
    await page.type(inputSelector, 'Yes.');
    await page.keyboard.press('Enter');
    await new Promise((r) => setTimeout(r, 2000));
    assert.ok(page.url().includes('/live'), 'Short answer must NOT terminate interview');

    // -------------------------------------------------------------
    // END INTERVIEW & AUDIT CLEANUP
    // -------------------------------------------------------------
    console.log('\n10. Ending interview and confirming modal...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const target = buttons.find((b) => b.textContent && b.textContent.includes('End Interview'));
      if (target) target.click();
    });

    await new Promise((r) => setTimeout(r, 1000));
    const modalConfirmed = await page.evaluate(() => {
      const modal = document.querySelector('div.fixed.inset-0');
      if (modal) {
        const btn = Array.from(modal.querySelectorAll('button')).find(
          (b) => b.textContent && b.textContent.includes('End Interview')
        );
        if (btn) {
          btn.click();
          return true;
        }
      }
      return false;
    });
    assert.ok(modalConfirmed, 'Modal confirm must be clicked');

    console.log('11. Waiting for navigation to report page...');
    await page.waitForFunction(() => window.location.href.includes('/report'), { timeout: 30000 });
    console.log('Final Page URL:', page.url());
    assert.ok(page.url().includes('/report'), 'Must land on /report page');

    console.log('\n=== REAL BROWSER VERIFICATION FOR ELENA ROSTOVA PASSED 100%! ===');
  } finally {
    await browser.close();
  }
}

runElenaBrowserVerification().catch((err) => {
  console.error('\nElena verification failed with error:', err);
  process.exit(1);
});
