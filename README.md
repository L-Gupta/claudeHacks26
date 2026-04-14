# HelloNeighbour 🦡

Voice-based anonymous neighbor connection app for UW-Madison dorm students. Built with Next.js, Claude AI, and real-time audio.

## How It Works

1. **Sign Up** — Enter your dorm, room, major, year, and pick your hobbies
2. **Record** — Hold the mic button to drop a 15-second voice note on the floor map
3. **Discover** — AI analyzes your profile + voice note to suggest compatible neighbors
4. **Listen** — Tap anonymous pins to hear voice notes with real-time waveform visualization
5. **Resonate** — Tap the heart button if you vibe with someone
6. **Match** — When it's mutual, identities are revealed with a personalized meetup suggestion

## Tech Stack

- **Next.js 14** — App Router with API routes
- **Tailwind CSS** — Styling with custom UW-Madison color palette
- **Claude API** (claude-sonnet-4-20250514) — Profile analysis, connection suggestions, meetup ideas
- **Web Audio API** — Recording, playback, and waveform visualization
- **KNN (k=3)** — From-scratch matching algorithm, no ML libraries
- **In-memory store** — Seeded with 3 demo profiles

## Quick Start

```bash
npm install
cp .env.local.example .env.local   # add your Anthropic API key
npm run dev
```

Open http://localhost:3000.

## Bucky Badger Logo

The app includes a hand-drawn SVG fallback. To use the official Bucky:

1. Download official assets from [brand.wisc.edu](https://brand.wisc.edu/downloads/)
2. Save as `public/bucky.png` (or `.svg`)
3. The Header component auto-detects and uses it

## Deploy to Vercel

Push to GitHub and import on [vercel.com](https://vercel.com). Add `ANTHROPIC_API_KEY` as an environment variable. Zero config needed.

## Without an API Key

The app works fully in demo mode with smart mock analysis — no API key required to try it out.
