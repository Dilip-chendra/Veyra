import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { InterviewerVideoManager } from "../src/lib/video/InterviewerVideoManager.ts";

test("Avatar Video Moments - Manifest and Asset Verification", async () => {
  const manifestPath = path.resolve(process.cwd(), "public/interviewer-videos/manifest.json");
  assert.ok(fs.existsSync(manifestPath), "manifest.json must exist in public/interviewer-videos");

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  assert.ok(manifest.marcus, "Marcus persona must exist in manifest");
  assert.ok(manifest.elena, "Elena persona must exist in manifest");

  // Verify all Marcus clips exist on disk
  let marcusCount = 0;
  for (const [category, clips] of Object.entries(manifest.marcus.clips)) {
    for (const clipPath of clips) {
      const fullPath = path.resolve(process.cwd(), "public", clipPath.replace(/^\//, ""));
      assert.ok(fs.existsSync(fullPath), `Marcus clip must exist: ${clipPath}`);
      marcusCount++;
    }
  }
  assert.equal(marcusCount, 35, "Marcus must have exactly 35 clips across 13 categories");

  // Verify all Elena clips exist on disk
  let elenaCount = 0;
  for (const [category, clips] of Object.entries(manifest.elena.clips)) {
    for (const clipPath of clips) {
      const fullPath = path.resolve(process.cwd(), "public", clipPath.replace(/^\//, ""));
      assert.ok(fs.existsSync(fullPath), `Elena clip must exist: ${clipPath}`);
      elenaCount++;
    }
  }
  assert.equal(elenaCount, 35, "Elena must have exactly 35 clips across 13 categories");
});

test("InterviewerVideoManager - Category Mapping & Clip Rotation", async () => {
  const manifestPath = path.resolve(process.cwd(), "public/interviewer-videos/manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

  const manager = new InterviewerVideoManager("male");
  manager.setManifest(manifest);

  assert.equal(manager.getInterviewer(), "marcus", "Male persona should initialize as marcus");

  // Test state mapping
  const listeningCategory = manager.mapStateToCategory("LISTENING", false);
  assert.ok(["listening", "acknowledging"].includes(listeningCategory), "Listening state should map to listening or acknowledging");
  assert.equal(manager.mapStateToCategory("QUESTIONING", true), "questioning");
  assert.equal(manager.mapStateToCategory("QUESTIONING", false), "questioning");
  assert.equal(manager.mapStateToCategory("THINKING", false), "thinking");
  assert.equal(manager.mapStateToCategory("CHALLENGING", false), "challenging");
  assert.equal(manager.mapStateToCategory("INTERRUPTING", true), "interrupting");
  assert.equal(manager.mapStateToCategory("CLOSING", true), "closing");

  // Test clip selection
  const clip1 = manager.selectVideoClip("LISTENING", false);
  assert.ok(clip1.url.startsWith("/interviewer-videos/marcus/"), "Clip must be a Marcus clip");
  assert.ok(["listening", "acknowledging"].includes(clip1.category), "Clip category should be listening or acknowledging");

  // Switch to female persona
  manager.setInterviewer("female");
  assert.equal(manager.getInterviewer(), "elena", "Female persona should switch to elena");

  const elenaClip = manager.selectVideoClip("QUESTIONING", true);
  assert.ok(elenaClip.url.startsWith("/interviewer-videos/elena/questioning/"), "Clip must be an Elena questioning clip");
});

test("Interviewer Video Generation Report - Integrity & Zero Cost Check", async () => {
  const reportPath = path.resolve(process.cwd(), "avatar-video-generation-report.json");
  assert.ok(fs.existsSync(reportPath), "avatar-video-generation-report.json must exist");

  const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
  assert.equal(report.totalClips, 70, "Total clips must be 70");
  assert.equal(report.validatedClips, 70, "Validated clips must be 70");
  assert.equal(report.items.length, 70, "Report items array must have 70 records");

  for (const item of report.items) {
    assert.equal(item.status, "VALIDATED_PLAYABLE", `Clip ${item.filename} must be VALIDATED_PLAYABLE`);
    assert.equal(item.resolution, "1280x720", `Clip ${item.filename} must be 1280x720`);
    assert.equal(item.fps, 30, `Clip ${item.filename} must be 30fps`);
    assert.ok(item.sha256.length === 64, `Clip ${item.filename} must have 64-char SHA256`);
  }
});
