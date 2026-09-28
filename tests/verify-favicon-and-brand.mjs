import puppeteer from 'puppeteer-core';
import assert from 'node:assert';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testFaviconAndBrand() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-web-security'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    console.log('1. Loading landing page http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

    // Verify favicon link tags in <head>
    const faviconLinks = await page.$$eval('link[rel*="icon"]', (links) =>
      links.map((l) => ({ rel: l.rel, href: l.href, type: l.type }))
    );
    console.log('Favicon links found in head:', faviconLinks);
    assert.ok(faviconLinks.length > 0, 'Must have favicon links');

    // Verify BrandLogo in Navbar
    const brandSvg = await page.$('nav svg[aria-label="Veyra V Logo"]');
    assert.ok(brandSvg, 'Navbar must contain the BrandLogo V svg');
    console.log('BrandLogo verified in Navbar!');

    // Verify Login page
    console.log('2. Loading login page http://localhost:3000/login ...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    const loginSvg = await page.$('svg[aria-label="Veyra V Logo"]');
    assert.ok(loginSvg, 'Login page must contain BrandLogo V svg');
    console.log('BrandLogo verified in Login Page!');

    console.log('\n=== ALL FAVICON AND BRAND LOGO CHECKS PASSED 100%! ===');
  } finally {
    await browser.close();
  }
}

testFaviconAndBrand().catch((err) => {
  console.error(err);
  process.exit(1);
});
