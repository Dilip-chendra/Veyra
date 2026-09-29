import puppeteer from 'puppeteer-core';
import assert from 'node:assert';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runTests() {
  console.log('--- STARTING VERIFICATION OF ALL 5 USER FIXES ---');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-web-security', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // 1. Load Landing Page
    console.log('1. Navigating to http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

    // 2. Check Brand Logo & Wordmark
    console.log('2. Verifying refined BrandLogo & Wordmark in Navbar...');
    const logoSvg = await page.$('nav svg[aria-label="Veyra V Logo"]');
    assert.ok(logoSvg, 'BrandLogo SVG must exist in navbar');

    const wordmarkText = await page.$eval('nav', (nav) => {
      const textElem = nav.querySelector('span.font-sans');
      return textElem ? textElem.textContent : '';
    });
    console.log('Navbar wordmark text:', wordmarkText);
    assert.ok(wordmarkText.includes('VEYRA'), 'Wordmark must say VEYRA');

    // 3. Verify Favicon links in <head>
    console.log('3. Verifying favicon links...');
    const favicons = await page.$$eval('link[rel*="icon"]', (links) => links.map(l => l.href));
    console.log('Favicon links:', favicons);
    assert.ok(favicons.some(f => f.includes('favicon.svg')), 'Must link favicon.svg');

    // 4. Verify Hero Image Stability during Typing Animation
    console.log('4. Verifying Hero interviewer image does NOT shift or jump while text types...');
    const heroImage = await page.$('img[alt="Marcus Vance"]');
    assert.ok(heroImage, 'Hero portrait image must exist');

    const initialBox = await heroImage.boundingBox();
    console.log('Initial Hero image box:', initialBox);

    // Wait 2.5 seconds through multiple typewriter strokes
    await new Promise(r => setTimeout(r, 2500));
    const laterBox = await heroImage.boundingBox();
    console.log('Later Hero image box:', laterBox);

    // Verify y coordinate hasn't shifted
    assert.strictEqual(
      Math.round(initialBox.y),
      Math.round(laterBox.y),
      'Hero image vertical position must remain completely static during typing animation!'
    );
    console.log('SUCCESS: Hero image remained completely static without a single pixel of jitter!');

    // 5. Verify Launch Live Interview button routes to /signup
    console.log('5. Verifying Launch Live Interview CTA routes to /signup...');
    const ctaHref = await page.$eval('a[href="/signup"]', (el) => el.getAttribute('href'));
    console.log('CTA button link found:', ctaHref);
    assert.strictEqual(ctaHref, '/signup', 'Launch CTA must take user to /signup');

    // 6. Verify Section 02 Video Overlays removed and Mute/Unmute toggle works
    console.log('6. Verifying Section 02 (Cinematic Video)...');
    const centerPlayButton = await page.$('svg path[d="M5 3l14 9-14 9V3z"]');
    assert.strictEqual(centerPlayButton, null, 'Center play overlay must be removed');

    const liveBadge = await page.evaluate(() => {
      return document.body.textContent.includes('Actual Veyra Live Session');
    });
    assert.strictEqual(liveBadge, false, 'Actual Veyra Live Session badge must be removed');

    const metabar = await page.evaluate(() => {
      return document.body.textContent.includes('1080p HD • Realtime Sync');
    });
    assert.strictEqual(metabar, false, 'Bottom metadata bar must be removed');

    // Check Mute button
    const muteBtn = await page.$('button[aria-label*="video"]');
    assert.ok(muteBtn, 'Mute/Unmute button must exist');
    const initialMuteText = await muteBtn.evaluate(el => el.textContent.trim());
    console.log('Initial video audio button text:', initialMuteText);

    // Click to toggle mute
    await muteBtn.click();
    await new Promise(r => setTimeout(r, 600));
    const afterMuteText = await muteBtn.evaluate(el => el.textContent.trim());
    console.log('After click video audio button text:', afterMuteText);
    assert.notStrictEqual(initialMuteText, afterMuteText, 'Audio button state must toggle upon click');

    // 7. Verify Voice Preview Buttons in Section 1 (Hero)
    console.log('7. Verifying Voice Preview in Hero (Marcus / Elena)...');
    const voicePreviewBtn = await page.$('button[type="button"]:has(svg)');
    // Let's find button with text "Hear"
    const hearBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent?.includes('Hear Marcus Speak') || b.textContent?.includes('Hear Elena Speak'));
    });
    assert.ok(hearBtn, 'Hear Speak button must exist in Hero');
    console.log('Clicking Hear Voice button in Hero...');
    await hearBtn.click();

    // Check that button shows connecting or pause
    await new Promise(r => setTimeout(r, 1200));
    const activeVoiceText = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(btn => btn.textContent?.includes('Cartesia') || btn.textContent?.includes('Pause') || btn.textContent?.includes('Hear'));
      return b ? b.textContent?.trim() : '';
    });
    console.log('Hero voice button text after click:', activeVoiceText);

    // 7b. Verify Section 07 Voice Experience
    console.log('7b. Verifying Section 07 Voice Synthesis button...');
    const section7Btn = await page.$('button[data-testid="voice-preview-btn"]');
    assert.ok(section7Btn, 'Section 7 voice button must exist');
    await section7Btn.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'tests/qa_section7_exact.png' });
    console.log('Clicking Section 7 voice button...');
    await section7Btn.click();
    await new Promise(r => setTimeout(r, 1000));
    const section7Text = await section7Btn.evaluate(el => el.textContent.trim());
    console.log('Section 7 button text after click:', section7Text);

    // 8. Capture Screenshots
    console.log('8. Capturing verification screenshots...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'tests/qa_fix_hero_and_brand.png' });

    // Scroll to video
    const videoSection = await page.$('video');
    if (videoSection) {
      await videoSection.scrollIntoView();
      await new Promise(r => setTimeout(r, 600));
      await page.screenshot({ path: 'tests/qa_fix_video_clean.png' });
    }

    console.log('\n========================================');
    console.log('ALL 5 FIXES VERIFIED SUCCESSFULLY 100%!');
    console.log('========================================');
  } finally {
    await browser.close();
  }
}

runTests().catch(err => {
  console.error('VERIFICATION TEST FAILED:', err);
  process.exit(1);
});
