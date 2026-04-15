# HelloNeighbour 🦡

Voice-based anonymous neighbor connection app for UW-Madison dorm students. Built with Next.js, Claude AI, and real-time audio.

## How It Works

1. **Sign Up** — Enter your name, dorm, room, major, year, and pick your hobbies. Optionally record a 15-second voice note.
2. **Explore** — Choose any dorm to browse. Use the arrows to navigate between floors.
3. **Discover** — Click on a room with a voice note to hear it, read their AI summary, and see their hobbies.
4. **Resonate** — Tap the heart if you vibe with someone.
5. **Match** — When it's mutual, identities are revealed with a personalized meetup suggestion from Claude.

## Tech Stack

- **Next.js 14** — App Router with server-side API routes
- **Tailwind CSS** — Warm white theme with UW-Madison red accent
- **Claude API** (`claude-sonnet-4-20250514`) — Profile analysis, connection suggestions, meetup ideas
- **Web Audio API** — Voice recording, playback, and waveform visualization
- **KNN (k=3)** — From-scratch matching algorithm in vanilla JS
- **In-memory store** — 12 seeded demo profiles across 3 dorms

## Project Structure

```
app/
  layout.js              Root layout
  page.js                Main page (signup → explore flow)
  globals.css            Animations + Tailwind base
  api/
    analyze/route.js     POST — Claude profile analysis
    users/route.js       GET/POST — Floor users + AI suggestions
    resonate/route.js    POST — Resonation + mutual match
components/
  Header.jsx             App header
  SignupForm.jsx         2-step signup (info → hobbies + voice)
  DormExplorer.jsx       Dorm selector, floor arrows, room grid
  VoiceModal.jsx         Room detail with waveform player
  MatchCard.jsx          Match reveal overlay
  ConfettiOverlay.jsx    Canvas confetti
  SuggestionsPanel.jsx   AI "who to contact" panel
  RecordButton.jsx       Animated mic button
  WaveformCanvas.jsx     Real-time audio visualizer
lib/
  claude.js              All Claude API calls (server-side)
  knn.js                 KNN algorithm from scratch
  store.js               In-memory data store + mock data
```

## Quick Start

```bash
npm install
cp .env.local.example .env.local   # add your Anthropic API key
npm run dev
```

Open http://localhost:3000.

## Environment Variables

Copy `.env.local.example` to `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Without the key, everything works using smart mock analysis.

## Deploy to Vercel

Push to GitHub → import on [vercel.com](https://vercel.com) → add `ANTHROPIC_API_KEY` as an environment variable. Zero config.
