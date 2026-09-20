# Veyra — Photorealistic AI Human Interviewer Platform

> An enterprise-grade AI technical interviewer platform that conducts adaptive live coding, system design, and behavioral interviews using a **Real Human Video Moment Engine**, active listening, persistent corporate interviewer personas, and evidence-backed evaluation scorecards.

---

## Key Highlights

- **Real Human Video Moment System**: Powered by 70 high-resolution 16:9 H.264 video moments across 13 behavioral states (idle, listening, speaking, questioning, thinking, clarifying, challenging, encouraging, acknowledging, explaining, interrupting, transitioning, closing).
- **Persistent Corporate Personas**:
  - **Marcus Vance** (`male`): Senior Engineering Director
  - **Elena Rostova** (`female`): VP of Engineering & Principal Technical Architect
- **Dual-Slot Seamless Cross-Fade Engine**: 200ms opacity cross-fades eliminate black flashes, stutter, and unnatural jumps.
- **Natural Voice & Bidirectional VAD**: Audible speech synthesis with voice priority filtering, Web Audio speech detection, and candidate interruption support.
- **Clean Hardware Teardown**: Comprehensive device lifecycle management ensuring camera, microphone, and screen share tracks cleanly stop when sessions end.
- **Interactive Live Workspace**: Monaco editor for code execution (Python, TS, Go) and SVG system design canvas with traffic and regional outage simulations.
- **Evidence-Backed Evaluation**: Verbatim quote citation, rubric scoring across 4 dimensions, and automated 5-step curriculum generation.
- **Developer Asset Inspection Suite**: Built-in inspection page at `/avatar-assets` showing real-time clip playback, SHA-256 hashes, and duration metadata.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components & Route Handlers)
- **Language**: TypeScript (Strict Mode)
- **Database & ORM**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **Audio & Video**: Web Audio API, Web Speech Synthesis / Recognition, HTML5 H.264 Faststart Video
- **Icons**: Lucide React (100% SVG, Zero Emojis)
- **Testing**: Node.js Native Test Runner (`node --test`)

---

## Getting Started

### Prerequisites

- Node.js 18+ (Tested on Node.js v24)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Dilip-chendra/Veyra.git
   cd Veyra
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment**:
   ```bash
   cp .env.example .env
   ```

4. **Initialize the Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing & Verification

Run the full automated test suite:

```bash
node --test tests/**/*.test.mjs
```

Run the end-to-end verification script:

```bash
node scripts/verify-real-human-system.mjs
```

Build for production:

```bash
npm run build
npm run start
```

---

## Project Structure

```
Veyra/
├── assets/                          # Master reference portraits & specifications
├── prisma/                          # Prisma schema and SQLite migration
├── public/
│   └── interviewer-videos/         # 70 playable H.264 video moments
│       ├── marcus/                  # 35 clips (13 behavioral states)
│       ├── elena/                   # 35 clips (13 behavioral states)
│       └── manifest.json            # Persona clip manifest
├── src/
│   ├── app/                         # Next.js App Router (43 routes)
│   │   ├── api/                     # REST API endpoints (interviews, auth, code, turns)
│   │   ├── avatar-assets/           # Internal asset inspection suite
│   │   ├── interviews/[id]/live/    # Live interview room
│   │   ├── interviews/[id]/report/  # Evidence-based scorecard
│   │   └── page.tsx                 # Landing page
│   ├── components/
│   │   ├── avatar/                  # RealHumanVideoInterviewer & PhotorealisticAvatar
│   │   ├── coding/                  # Monaco code editor integration
│   │   ├── interview/               # LiveRoom, transcript, timer
│   │   ├── voice/                   # VoiceController, Web Audio VAD
│   │   └── whiteboard/              # SystemDesignCanvas
│   ├── lib/                         # InterviewBrain, FollowUpEngine, VideoManager
│   └── types/                       # TypeScript domain interfaces
├── tests/                           # Unit and integration test suites
└── avatar-video-generation-report.json
```

---

## License

MIT
