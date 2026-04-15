import Anthropic from '@anthropic-ai/sdk';
import { getUser } from '@/lib/store';

const MOCK_ICEBREAKERS = [
  "So I noticed we're both into the same stuff — what got you started?",
  "Floor neighbors who match have to get food at least once. Union South or Liz Waters?",
  "Okay real talk — best late-night snack spot near campus?",
  "I heard your voice note and it gave main character energy. What's your origin story?",
  "Hot take time: best study spot on campus? I need to know if we can be friends.",
  "So are you a Memorial Union Terrace sunset person or a State Street late-night person?",
  "If you could only eat at one campus restaurant for a semester, which one?",
  "What's the most random thing you've done since coming to UW?",
];

export async function POST(req) {
  const { userId, partnerId } = await req.json();
  const userA = getUser(userId);
  const userB = getUser(partnerId);

  if (!userA || !userB) {
    return Response.json({ error: 'Users not found' }, { status: 404 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    const idx = Math.floor(Math.random() * MOCK_ICEBREAKERS.length);
    return Response.json({ icebreaker: MOCK_ICEBREAKERS[idx] });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      system: `Generate ONE short, fun icebreaker message for a UW-Madison student to send to a dorm neighbor they just matched with. Make it specific to their shared interests. Casual, friendly, college vibe. Just the message text, no quotes or explanation.`,
      messages: [{
        role: 'user',
        content: `Me: ${userA.summary} (${userA.major}, hobbies: ${(userA.hobbies||[]).join(', ')})\nThem: ${userB.summary} (${userB.major}, hobbies: ${(userB.hobbies||[]).join(', ')})`,
      }],
    });
    return Response.json({ icebreaker: msg.content[0].text });
  } catch {
    const idx = Math.floor(Math.random() * MOCK_ICEBREAKERS.length);
    return Response.json({ icebreaker: MOCK_ICEBREAKERS[idx] });
  }
}
