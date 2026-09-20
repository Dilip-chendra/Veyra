import * as THREE from "three";
import { BehaviorState, Emotion, GazeTarget, GestureType } from "@/types";

export interface BlendshapeWeights {
  jawOpen: number;
  mouthSmileLeft: number;
  mouthSmileRight: number;
  mouthPucker: number;
  mouthFunnel: number;
  eyeBlinkLeft: number;
  eyeBlinkRight: number;
  eyeSquintLeft: number;
  eyeSquintRight: number;
  browInnerUp: number;
  browDownLeft: number;
  browDownRight: number;
  browOuterUpLeft: number;
  browOuterUpRight: number;
  cheekPuff: number;
}

export class AvatarFaceRig {
  public weights: BlendshapeWeights = {
    jawOpen: 0,
    mouthSmileLeft: 0,
    mouthSmileRight: 0,
    mouthPucker: 0,
    mouthFunnel: 0,
    eyeBlinkLeft: 0,
    eyeBlinkRight: 0,
    eyeSquintLeft: 0,
    eyeSquintRight: 0,
    browInnerUp: 0,
    browDownLeft: 0,
    browDownRight: 0,
    browOuterUpLeft: 0,
    browOuterUpRight: 0,
    cheekPuff: 0,
  };

  public targetWeights: Partial<BlendshapeWeights> = {};

  public headRotation: THREE.Euler = new THREE.Euler(0, 0, 0);
  public targetHeadRotation: THREE.Euler = new THREE.Euler(0, 0, 0);

  public bodyPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public targetBodyPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  public eyeGaze: THREE.Vector2 = new THREE.Vector2(0, 0);
  public targetEyeGaze: THREE.Vector2 = new THREE.Vector2(0, 0);

  private lastBlinkTime: number = 0;
  private nextBlinkInterval: number = 3.5;
  private isBlinking: boolean = false;
  private blinkProgress: number = 0;

  private nodPhase: number = 0;
  private isNodding: boolean = false;

  private audioAnalyser: AnalyserNode | null = null;
  private audioDataArray: Uint8Array | null = null;

  public setAudioAnalyser(analyser: AnalyserNode) {
    this.audioAnalyser = analyser;
    this.audioDataArray = new Uint8Array(analyser.frequencyBinCount);
  }

  public triggerNod(intensity: number = 1.0) {
    this.isNodding = true;
    this.nodPhase = 0;
  }

  public update(deltaTime: number, state: BehaviorState, emotion: Emotion, gaze: GazeTarget, gesture: GestureType) {
    const time = performance.now() * 0.001;

    // 1. Procedural Blinking
    if (!this.isBlinking && time - this.lastBlinkTime > this.nextBlinkInterval) {
      this.isBlinking = true;
      this.blinkProgress = 0;
      this.lastBlinkTime = time;
      this.nextBlinkInterval = 2.0 + Math.random() * 3.5; // 2.0 - 5.5s random intervals
    }

    if (this.isBlinking) {
      this.blinkProgress += deltaTime * 8.0; // ~125ms blink duration
      if (this.blinkProgress >= Math.PI) {
        this.isBlinking = false;
        this.weights.eyeBlinkLeft = 0;
        this.weights.eyeBlinkRight = 0;
      } else {
        const blinkAmount = Math.sin(this.blinkProgress);
        this.weights.eyeBlinkLeft = blinkAmount;
        this.weights.eyeBlinkRight = blinkAmount;
      }
    }

    // 2. Continuous Micro-Movement (Breathing & physiological drift)
    const breathingOffset = Math.sin(time * 1.5) * 0.015;
    const microYaw = Math.sin(time * 0.7) * 0.02;
    const microPitch = Math.cos(time * 0.9) * 0.015;

    // 3. Gaze & Head Direction based on GazeTarget
    let targetGazeX = 0;
    let targetGazeY = 0;
    let targetPitch = 0;
    let targetYaw = 0;
    let targetRoll = 0;

    switch (gaze) {
      case "CANDIDATE":
        targetGazeX = 0;
        targetGazeY = 0;
        targetPitch = 0;
        targetYaw = 0;
        break;
      case "SCREEN":
        targetGazeX = 0.35;
        targetGazeY = -0.15;
        targetPitch = -0.08;
        targetYaw = 0.25;
        break;
      case "UP_THINKING":
        targetGazeX = -0.2;
        targetGazeY = 0.3;
        targetPitch = 0.12;
        targetYaw = -0.15;
        targetRoll = 0.08;
        break;
      case "DOWN_REFLECTING":
        targetGazeX = 0;
        targetGazeY = -0.3;
        targetPitch = -0.15;
        targetYaw = 0.05;
        break;
    }

    // 4. Nodding Animation
    if (this.isNodding) {
      this.nodPhase += deltaTime * 7.0;
      targetPitch += Math.sin(this.nodPhase) * 0.12;
      if (this.nodPhase >= Math.PI * 2) {
        this.isNodding = false;
      }
    }

    // 5. Posture adjustments
    let targetPosZ = 0;
    if (gesture === "posture_forward" || state === "CHALLENGING") {
      targetPosZ = 0.12; // lean forward into camera
      targetPitch += 0.05;
    } else if (gesture === "posture_back") {
      targetPosZ = -0.08;
    }

    // 6. Emotion Blendshape Targets
    let targetSmile = 0;
    let targetBrowUp = 0;
    let targetBrowDown = 0;
    let targetSquint = 0;

    if (emotion === "warm") {
      targetSmile = 0.45;
      targetBrowUp = 0.15;
    } else if (emotion === "curious") {
      targetBrowUp = 0.4;
      targetRoll += 0.06; // head tilt
    } else if (emotion === "skeptical") {
      targetSquint = 0.35;
      targetBrowDown = 0.4;
      targetSmile = 0.05;
    } else if (emotion === "thoughtful") {
      targetBrowDown = 0.25;
      targetBrowUp = 0.2;
      targetRoll -= 0.05;
    }

    // 7. Audio-Driven Lip Sync (Visemes)
    let audioJaw = 0;
    let audioPucker = 0;
    if (this.audioAnalyser && this.audioDataArray) {
      (this.audioAnalyser as any).getByteFrequencyData(this.audioDataArray);
      // Low frequencies: vowels (jaw open)
      let lowSum = 0;
      for (let i = 2; i < 14; i++) lowSum += this.audioDataArray[i];
      const lowAvg = lowSum / 12;

      // Mid frequencies: consonants / formants
      let midSum = 0;
      for (let i = 15; i < 40; i++) midSum += this.audioDataArray[i];
      const midAvg = midSum / 25;

      if (lowAvg > 15) {
        audioJaw = Math.min(1.0, (lowAvg / 140) * 0.9);
      }
      if (midAvg > 25) {
        audioPucker = Math.min(0.8, (midAvg / 180) * 0.7);
      }
    }

    // 8. Smoothly Interpolate (LERP) all targets
    const lerpFactor = Math.min(1.0, deltaTime * 8.0);
    this.weights.jawOpen = THREE.MathUtils.lerp(this.weights.jawOpen, audioJaw, deltaTime * 20.0);
    this.weights.mouthPucker = THREE.MathUtils.lerp(this.weights.mouthPucker, audioPucker, deltaTime * 16.0);
    this.weights.mouthSmileLeft = THREE.MathUtils.lerp(this.weights.mouthSmileLeft, targetSmile, lerpFactor);
    this.weights.mouthSmileRight = THREE.MathUtils.lerp(this.weights.mouthSmileRight, targetSmile, lerpFactor);
    this.weights.browInnerUp = THREE.MathUtils.lerp(this.weights.browInnerUp, targetBrowUp, lerpFactor);
    this.weights.browDownLeft = THREE.MathUtils.lerp(this.weights.browDownLeft, targetBrowDown, lerpFactor);
    this.weights.browDownRight = THREE.MathUtils.lerp(this.weights.browDownRight, targetBrowDown, lerpFactor);
    this.weights.eyeSquintLeft = THREE.MathUtils.lerp(this.weights.eyeSquintLeft, targetSquint, lerpFactor);
    this.weights.eyeSquintRight = THREE.MathUtils.lerp(this.weights.eyeSquintRight, targetSquint, lerpFactor);

    this.headRotation.x = THREE.MathUtils.lerp(this.headRotation.x, targetPitch + microPitch, lerpFactor);
    this.headRotation.y = THREE.MathUtils.lerp(this.headRotation.y, targetYaw + microYaw, lerpFactor);
    this.headRotation.z = THREE.MathUtils.lerp(this.headRotation.z, targetRoll, lerpFactor);

    this.bodyPosition.z = THREE.MathUtils.lerp(this.bodyPosition.z, targetPosZ, lerpFactor);
    this.bodyPosition.y = breathingOffset;

    this.eyeGaze.x = THREE.MathUtils.lerp(this.eyeGaze.x, targetGazeX, lerpFactor);
    this.eyeGaze.y = THREE.MathUtils.lerp(this.eyeGaze.y, targetGazeY, lerpFactor);
  }
}
