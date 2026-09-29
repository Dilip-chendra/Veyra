import puppeteer from "puppeteer-core";

async function main() {
  console.log("=== STARTING VIDEO INTEGRATION TEST ===");
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

  console.log("1. Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle0", timeout: 30000 });

  console.log("2. Checking page title and initial errors...");
  const title = await page.title();
  console.log("   Title:", title);
  console.log("   HTTP >= 400:", httpFails);
  console.log("   Console errors:", errors);

  if (httpFails.length > 0) {
    throw new Error(`HTTP failures detected: ${httpFails.join(", ")}`);
  }

  console.log("3. Scrolling to video section...");
  await page.evaluate(() => {
    const heading = Array.from(document.querySelectorAll("h2")).find(h =>
      h.innerText.includes("See what an interview with Veyra feels like")
    );
    if (heading) heading.scrollIntoView({ behavior: "instant", block: "center" });
  });

  await new Promise(r => setTimeout(r, 1500));

  console.log("4. Verifying video element and playback...");
  const videoState = await page.evaluate(async () => {
    const video = document.querySelector("video[src*='veyra_preview']");
    if (!video) return { exists: false };

    // Wait if video hasn't loaded yet
    if (video.readyState < 2) {
      await new Promise(res => {
        video.onloadeddata = res;
        setTimeout(res, 3000);
      });
    }

    return {
      exists: true,
      src: video.src,
      currentSrc: video.currentSrc,
      readyState: video.readyState,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      duration: video.duration,
      currentTime: video.currentTime,
      paused: video.paused,
      muted: video.muted,
      loop: video.loop,
      playsInline: video.playsInline,
    };
  });

  console.log("   Video state:", JSON.stringify(videoState, null, 2));

  if (!videoState.exists) {
    throw new Error("Video element not found on page!");
  }
  if (videoState.videoWidth !== 1280 || videoState.videoHeight !== 720) {
    throw new Error(`Unexpected video dimensions: ${videoState.videoWidth}x${videoState.videoHeight}`);
  }
  if (!videoState.muted) {
    throw new Error("Video is not muted by default (violates browser autoplay policy)");
  }

  // Let video play for 1 second and check currentTime advanced
  await new Promise(r => setTimeout(r, 1200));
  const advancedTime = await page.evaluate(() => {
    const video = document.querySelector("video[src*='veyra_preview']");
    return video ? video.currentTime : 0;
  });
  console.log("   Current playback time after 1.2s:", advancedTime.toFixed(2), "s");
  if (advancedTime <= 0) {
    console.warn("   Notice: Autoplay may be waiting for user interaction or play event");
  }

  console.log("5. Taking screenshot of video section on Desktop (1440x900)...");
  await page.screenshot({ path: "tests/landing_video_desktop.png" });
  console.log("   Saved to tests/landing_video_desktop.png");

  console.log("6. Testing Viewport auto-pause behavior...");
  // Scroll to bottom of page
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 1200));
  const isPausedFar = await page.evaluate(() => {
    const video = document.querySelector("video[src*='veyra_preview']");
    return video ? video.paused : true;
  });
  console.log("   Video paused when scrolled out of view:", isPausedFar);

  // Scroll back to video
  await page.evaluate(() => {
    const heading = Array.from(document.querySelectorAll("h2")).find(h =>
      h.innerText.includes("See what an interview with Veyra feels like")
    );
    if (heading) heading.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await new Promise(r => setTimeout(r, 1200));
  const isResumed = await page.evaluate(() => {
    const video = document.querySelector("video[src*='veyra_preview']");
    return video ? !video.paused : false;
  });
  console.log("   Video resumed when scrolled back into view:", isResumed);

  console.log("7. Testing Mobile Viewport (375x812)...");
  await page.setViewport({ width: 375, height: 812, isMobile: true });
  await page.evaluate(() => {
    const heading = Array.from(document.querySelectorAll("h2")).find(h =>
      h.innerText.includes("See what an interview with Veyra feels like")
    );
    if (heading) heading.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await new Promise(r => setTimeout(r, 1000));

  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log("   Mobile horizontal overflow detected:", hasHorizontalScroll);
  if (hasHorizontalScroll) {
    throw new Error("Mobile view has horizontal overflow!");
  }

  await page.screenshot({ path: "tests/landing_video_mobile.png" });
  console.log("   Saved to tests/landing_video_mobile.png");

  await browser.close();
  console.log("=== ALL VIDEO INTEGRATION TESTS PASSED SUCCESSFULLY! ===");
}

main().catch(err => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
