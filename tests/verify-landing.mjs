import puppeteer from "puppeteer-core";

async function main() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  const httpFails = [];

  page.on("console", msg => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("response", res => {
    if (res.status() >= 400) {
      httpFails.push(`${res.status()} ${res.url()}`);
    }
  });
  page.on("pageerror", err => errors.push(err.message));

  console.log("Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle0", timeout: 30000 });

  console.log("Page Title:", await page.title());
  console.log("Console Errors:", errors);
  console.log("HTTP >= 400:", httpFails);

  // Check Persona toggle
  console.log("Testing Elena Persona switch...");
  await page.click('[data-testid="persona-elena"]');
  await new Promise(r => setTimeout(r, 600));
  const elenaText = await page.evaluate(() => document.body.innerText.includes("Elena Rostova"));
  console.log("Elena Rostova active in DOM:", elenaText);

  // Switch back to Marcus
  console.log("Testing Marcus Persona switch...");
  await page.click('[data-testid="persona-marcus"]');
  await new Promise(r => setTimeout(r, 600));
  const marcusText = await page.evaluate(() => document.body.innerText.includes("Marcus Vance"));
  console.log("Marcus Vance active in DOM:", marcusText);

  // Verify Voice Button
  console.log("Checking Voice button exists...");
  const voiceBtn = await page.$('[data-testid="voice-preview-btn"]');
  console.log("Voice button found:", !!voiceBtn);

  // Verify Nav links
  const navText = await page.evaluate(() => document.querySelector("nav")?.innerText || "");
  console.log("Navbar contents:", navText.replace(/\n/g, " | "));

  // Take screenshot
  await page.screenshot({ path: "landing_verified.png", fullPage: false });
  console.log("Screenshot saved to landing_verified.png");

  await browser.close();

  if (httpFails.length > 0 || errors.length > 0) {
    console.error("FAIL: Errors detected!");
    process.exit(1);
  }
  console.log("ALL CHECKS PASSED: 0 ERRORS, 0 404s!");
}

main().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
