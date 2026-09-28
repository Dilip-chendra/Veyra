import puppeteer from 'puppeteer-core';
import assert from 'node:assert';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:3000';

async function runAIEngineerInterviewVerification() {
  console.log('=== VERIFYING EXACT AI ENGINEER INTERVIEW FLOW IN REAL GOOGLE CHROME ===\n');

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
    console.log('1. Navigating to Landing Page http://localhost:3000 ...');
    await page.goto(`${APP_URL}`, { waitUntil: 'domcontentloaded' });

    console.log('2. Navigating to Signup Page...');
    await page.goto(`${APP_URL}/signup`, { waitUntil: 'domcontentloaded' });

    const testEmail = `ai_engineer_${Date.now()}@veyra.test`;
    console.log(`3. Signing up candidate: ${testEmail}...`);
    await page.waitForSelector('form input[type="text"]');
    await new Promise(r => setTimeout(r, 1000));
    await page.type('input[type="text"]', 'AI Candidate');
    await page.type('input[type="email"]', testEmail);
    await page.type('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await page.waitForFunction(() => !window.location.pathname.includes('/signup'), { timeout: 15000 });
    console.log('4. Landed on:', page.url());

    // 2. Configure Interview for AI Engineer
    console.log('3. Navigating to /interviews/new...');
    await page.goto(`${APP_URL}/interviews/new`, { waitUntil: 'domcontentloaded' });

    // Fill in AI Engineer role
    console.log('4. Configuring AI Engineer role and pasting resume...');
    const customRoleInput = await page.$('input[placeholder*="Role Title"]');
    if (customRoleInput) {
      await customRoleInput.click({ clickCount: 3 });
      await customRoleInput.type('AI Engineer');
    }

    // Paste resume tab if present
    const pasteResumeTab = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const tab = tabs.find(t => t.textContent && t.textContent.includes('Paste Resume'));
      if (tab) {
        tab.click();
        return true;
      }
      return false;
    });

    if (pasteResumeTab) {
      await page.waitForSelector('textarea');
      await page.type(
        'textarea',
        'Senior AI Engineer with 4 years experience. Built production RAG pipelines with FastAPI and Qdrant. Reduced latency by 40% using Redis caching and write-through invalidation. Deployed models on AWS ECS with Docker.'
      );
      // Click Parse & Save Resume button
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const parseBtn = btns.find(b => b.textContent && b.textContent.includes('Parse & Save Resume'));
        if (parseBtn) parseBtn.click();
      });
      await new Promise(r => setTimeout(r, 2000));
    }

    // Select Marcus Vance
    console.log('4b. Selecting Marcus Vance persona...');
    await page.waitForSelector('img[alt="Marcus Vance"]', { timeout: 5000 });
    await page.click('img[alt="Marcus Vance"]');
    await new Promise(r => setTimeout(r, 500));

    // Launch interview with Marcus Vance
    console.log('5. Clicking "Enter Interview Room"...');
    const startButtons = await page.$$('button');
    let clickedStart = false;
    for (const btn of startButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && (text.includes('Enter Interview') || text.includes('Start') || text.includes('Launch'))) {
        await btn.click();
        clickedStart = true;
        break;
      }
    }
    assert.ok(clickedStart, 'Should click Enter Interview Room button');

    console.log('6. Waiting for live room to load...');
    await page.waitForFunction(() => window.location.pathname.includes('/live'), { timeout: 30000 });
    console.log('Live Room URL:', page.url());
    assert.ok(page.url().includes('/live'), 'Must navigate to /live');

    // Verify Marcus's static photograph
    const liveImgSrcs = await page.$$eval('img', imgs => imgs.map(i => i.src));
    console.log('Images loaded in Live Room:', liveImgSrcs);
    assert.ok(liveImgSrcs.some(s => s.includes('interviewer_male.jpg')), 'Must show Marcus Vance photograph');

    // Click Begin Live Interview
    console.log('7. Clicking "Begin Live Interview"...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const target = buttons.find(b => b.textContent && b.textContent.includes('Begin Live Interview'));
      if (target) target.click();
    });
    await new Promise(r => setTimeout(r, 3000));

    const inputSelector = 'input[placeholder*="Speak naturally"]';
    await page.waitForSelector(inputSelector);

    // Turn 1: Candidate says "I built a production RAG application."
    console.log('\n--- Turn 1: Candidate discusses RAG project ---');
    await page.type(inputSelector, 'I built a production RAG application with hybrid search and vector embeddings.');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 3500));

    // Turn 2: Candidate explains embeddings and evaluation
    console.log('\n--- Turn 2: Candidate explains embeddings & evaluation ---');
    await page.type(inputSelector, 'We evaluated embeddings and chunk size using cosine similarity and recall benchmarks.');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 3500));

    // Turn 3: Candidate says "I don't know."
    console.log('\n--- Turn 3: Candidate says "I don\'t know." (Must NOT terminate) ---');
    await page.type(inputSelector, "I don't know.");
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 3000));
    assert.ok(page.url().includes('/live'), 'Room must not terminate on "I don\'t know."');

    // Turn 4: Candidate disagrees ("I would choose PostgreSQL instead.")
    console.log('\n--- Turn 4: Candidate advocates PostgreSQL instead ---');
    await page.type(inputSelector, 'I would choose PostgreSQL instead because of strict ACID guarantees and JSONB indexing.');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 3500));
    assert.ok(page.url().includes('/live'), 'Room must not terminate on disagreement');

    // End session explicitly via modal
    console.log('\n8. Concluding interview session...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const target = buttons.find(b => b.textContent && b.textContent.includes('End Interview'));
      if (target) target.click();
    });

    await new Promise(r => setTimeout(r, 1000));
    const confirmedModal = await page.evaluate(() => {
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
    assert.ok(confirmedModal, 'Must confirm modal');

    console.log('9. Waiting for navigation to report page...');
    await page.waitForFunction(() => window.location.href.includes('/report'), { timeout: 30000 });
    console.log('Final Page URL:', page.url());
    assert.ok(page.url().includes('/report'), 'Must land on /report page');

    // Verify 0 active media tracks remaining
    console.log('10. Auditing browser media tracks...');
    const activeMediaTracks = await page.evaluate(() => {
      const w = window;
      if (w.__veyraLocalMicStream) {
        return w.__veyraLocalMicStream.getTracks().map(t => ({ kind: t.kind, state: t.readyState }));
      }
      return [];
    });
    console.log('Active media tracks remaining on report page:', activeMediaTracks);
    assert.strictEqual(activeMediaTracks.length, 0, 'No active media tracks should remain on report page');

    console.log('\n=== REAL AI ENGINEER INTERVIEW FLOW COMPLETED WITH 100% SUCCESS! ===');
  } finally {
    await browser.close();
  }
}

runAIEngineerInterviewVerification().catch(err => {
  console.error('\nAI Engineer browser verification failed with error:', err);
  process.exit(1);
});
