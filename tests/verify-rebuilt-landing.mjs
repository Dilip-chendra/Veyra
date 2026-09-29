import puppeteer from "puppeteer-core";
import path from "path";

async function verifyLanding() {
  console.log("=== VEYRA COMPLETE REINVENTED LANDING PAGE QA ===");
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  const httpFails = [];

  page.on("console", msg => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("response", res => {
    // Ignore cartesia TTS API if not clicked yet
    if (res.status() >= 400) {
      httpFails.push(`${res.status()} ${res.url()}`);
    }
  });
  page.on("pageerror", err => errors.push(err.message));

  console.log("1. Navigating to http://localhost:3000 ...");
  const res = await page.goto("http://localhost:3000", { waitUntil: "networkidle0", timeout: 30000 });
  console.log("Response status:", res.status());

  const title = await page.title();
  console.log("Page Title:", title);

  // Take hero screenshot
  await page.screenshot({ path: "tests/qa_hero_desktop.png" });
  console.log("Saved: tests/qa_hero_desktop.png");

  // Verify DOM Text Checks
  const bodyText = await page.evaluate(() => document.body.innerText);

  const lowerText = bodyText.toLowerCase();

  const checks = [
    { name: "01. Hero Section", passed: lowerText.includes("the interview") && lowerText.includes("adapts to you") },
    { name: "02. Brand Ecosystem Wall", passed: lowerText.includes("trusted by") && lowerText.includes("communication") },
    { name: "03. Kinetic Manifesto", passed: lowerText.includes("an interview") && lowerText.includes("is not a script") },
    { name: "04. Conveyor vs Dynamic Flow", passed: lowerText.includes("conveyor belt") && lowerText.includes("dynamic cross-examination") },
    { name: "05. Live Adaptive Dialogue", passed: lowerText.includes("every question emerges from your last sentence") },
    { name: "06. Realtime Voice Experience", passed: lowerText.includes("not a chatbot") && lowerText.includes("a conversation") },
    { name: "07. Cinematic Product Video", passed: lowerText.includes("see what an interview with veyra feels like") },
    { name: "08. Resume Intelligence", passed: lowerText.includes("your resume becomes the interview blueprint") },
    { name: "09. Job & Skill Graph", passed: lowerText.includes("job description → targeted skill graph") },
    { name: "10. Project Defense Scene", passed: lowerText.includes("defend your actual github repositories") },
    { name: "11. 3D Gyroscopic Core", passed: lowerText.includes("the interview intelligence core") },
    { name: "12. Multi-Turn Memory Timeline", passed: lowerText.includes("interview memory across 20+ turns") },
    { name: "13. Interview Type Explorer", passed: lowerText.includes("every discipline. precisely tuned") },
    { name: "14. Evaluation Dossier Report", passed: lowerText.includes("post-interview intelligence dossier") && lowerText.includes("technical diagnostic") },
    { name: "15. Human Cinematic Moment", passed: lowerText.includes("the difference happens") && lowerText.includes("after your answer") },
    { name: "16. Final Monolithic CTA", passed: lowerText.includes("stop rehearsing scripts") && lowerText.includes("start defending real decisions") }
  ];

  console.log("\n=== SECTION DOM CHECKS ===");
  let allSectionsPassed = true;
  for (const c of checks) {
    console.log(`${c.passed ? "✓ PASS" : "✗ FAIL"}: ${c.name}`);
    if (!c.passed) allSectionsPassed = false;
  }

  // 2. Interactive Test: 3D Canvas element
  const canvasExists = await page.evaluate(() => {
    const canvas = document.querySelector("#architecture canvas");
    return !!canvas;
  });
  console.log(`\n3D WebGL Canvas mounted: ${canvasExists ? "✓ YES" : "✗ NO"}`);

  // 3. Interactive Test: Report Preview tab switching
  console.log("\nTesting Report Dossier Tab Switch...");
  const tabSwitched = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const roadmapBtn = buttons.find(b => b.innerText.includes("Your Next 7 Days Plan"));
    if (roadmapBtn) {
      roadmapBtn.click();
      return true;
    }
    return false;
  });
  await new Promise(r => setTimeout(r, 400));
  const roadmapVisible = await page.evaluate(() => document.body.innerText.includes("Your Tailored 7-Day Sprint Curriculum"));
  console.log(`Roadmap tab clicked and rendered: ${roadmapVisible ? "✓ YES" : "✗ NO"}`);

  // Capture Marquee Section screenshot
  await page.evaluate(() => {
    const marqueeSection = document.querySelector("#ecosystem");
    if (marqueeSection) marqueeSection.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: "tests/qa_marquee_desktop.png" });
  console.log("Saved: tests/qa_marquee_desktop.png");

  // 4. Test Mobile Viewport
  console.log("\nTesting Mobile Viewport (390x844)...");
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle0", timeout: 30000 });
  await page.screenshot({ path: "tests/qa_hero_mobile.png" });
  console.log("Saved: tests/qa_hero_mobile.png");

  // Scroll mobile to middle to capture 3D / Flow
  await page.evaluate(() => window.scrollBy(0, 1600));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: "tests/qa_mobile_scroll.png" });
  console.log("Saved: tests/qa_mobile_scroll.png");

  await browser.close();

  console.log("\n=== FINAL TEST REPORT ===");
  console.log("Console Errors:", errors.length === 0 ? "NONE (Clean)" : errors);
  console.log("HTTP 400+ Fails:", httpFails.length === 0 ? "NONE (Clean)" : httpFails);
  console.log("All 16 Sections Present:", allSectionsPassed ? "YES (100% COMPLETE)" : "SOME MISSING");

  if (!allSectionsPassed || errors.length > 0 || httpFails.length > 0) {
    process.exit(1);
  }
}

verifyLanding().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
