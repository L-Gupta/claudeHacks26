# NeighborNote 🦡

Voice-based anonymous neighbor connection app for UW-Madison dorm students.

## How It Works

1. **Record** — Hold the mic button to record a 15-second voice note about yourself
2. **Drop** — Your note appears as an animated pin on the interactive dorm floor map
3. **Listen** — Tap anonymous pins to hear voice notes with real-time waveform visualization
4. **Resonate** — Tap the heart button if you vibe with someone
5. **Match** — When it's mutual, identities are revealed with a personalized meetup suggestion

## Tech

- Single-file React app (inline JSX via Babel standalone)
- Tailwind CSS via CDN
- Web Audio API for recording, playback, and waveform visualization
- KNN (k=3) matching algorithm implemented from scratch — no ML libraries
- Claude API integration for voice note analysis and meetup suggestions
- SVG floor map and hand-drawn Bucky Badger logo

## Run Locally

```bash
npx serve .
```

Then open `http://localhost:3000`.

## Deploy to Vercel

Push this repo and import it on [vercel.com](https://vercel.com) — zero config required.

## Claude API (Optional)

Click the gear icon in the header to enter your Anthropic API key. Without a key, the app uses smart mock analysis that works perfectly for demos.
