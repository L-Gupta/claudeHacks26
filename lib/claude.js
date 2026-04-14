import Anthropic from '@anthropic-ai/sdk';

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function analyzeProfile({ transcript, major, year, hobbies }) {
  if (!process.env.ANTHROPIC_API_KEY) return mockAnalyze({ transcript, hobbies });

  try {
    const client = getClient();
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: `You are analyzing a UW-Madison student's profile to extract personality and interest signals.
The student provided:
- Major: ${major}
- Year: ${year}
- Self-selected hobbies: ${(hobbies || []).join(', ')}
- Voice note transcript: "${transcript}"

Return ONLY a JSON object with these exact fields: energy_level (0-1), introvert_extrovert_score (0-1 where 1=extrovert), interests (array of strings from: music, sports, gaming, art, food, tech, outdoors, film, fashion, academics), tone_warmth (0-1), humor_score (0-1), summary (one warm sentence combining their major, interests, and personality vibe). No markdown, no explanation, just the JSON.`,
      messages: [{ role: 'user', content: `Analyze this student's profile and voice note.` }],
    });
    return JSON.parse(msg.content[0].text);
  } catch (e) {
    console.error('Claude analyze error:', e.message);
    return mockAnalyze({ transcript, hobbies });
  }
}

export async function suggestMeetup(profileA, profileB) {
  if (!process.env.ANTHROPIC_API_KEY) return mockMeetup();

  try {
    const client = getClient();
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: 'Generate one specific, warm, creative meetup suggestion for two UW-Madison dorm students who just matched. Max 2 sentences. Be specific about place and time. Reference UW-Madison landmarks like the Terrace, Memorial Union, Lakeshore Path, State Street, or College Library.',
      messages: [{ role: 'user', content: `Student A: ${profileA.summary} (${profileA.major}, hobbies: ${(profileA.hobbies||[]).join(', ')})\nStudent B: ${profileB.summary} (${profileB.major}, hobbies: ${(profileB.hobbies||[]).join(', ')})\nSuggest a low-stakes meetup.` }],
    });
    return msg.content[0].text;
  } catch {
    return mockMeetup();
  }
}

export async function suggestConnections(userProfile, neighbors) {
  if (!process.env.ANTHROPIC_API_KEY) return mockSuggestions(userProfile, neighbors);

  try {
    const client = getClient();
    const neighborList = neighbors.map((n, i) =>
      `${i+1}. Room ${n.room}: ${n.summary} (Major: ${n.major}, Hobbies: ${(n.hobbies||[]).join(', ')})`
    ).join('\n');

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: 'You are a friendly matchmaker for UW-Madison dorm students. Given a student profile and their nearby neighbors, suggest the top connections with brief, warm, specific reasons referencing shared interests or complementary qualities. Return ONLY a JSON array of objects with fields: room (string), reason (one sentence, warm and specific). No markdown.',
      messages: [{ role: 'user', content: `My profile: ${userProfile.summary} (Major: ${userProfile.major}, Year: ${userProfile.year}, Hobbies: ${(userProfile.hobbies||[]).join(', ')})\n\nNearby students:\n${neighborList}` }],
    });
    return JSON.parse(msg.content[0].text);
  } catch {
    return mockSuggestions(userProfile, neighbors);
  }
}

function mockAnalyze({ transcript, hobbies }) {
  const tl = (transcript || '').toLowerCase();
  const cats = ['music','sports','gaming','art','food','tech','outdoors','film','fashion','academics'];
  const kw = {
    music:['music','beat','song','sing'], sports:['sports','game','basketball','gym','badger'],
    gaming:['game','play','video','nintendo'], art:['art','draw','paint','design'],
    food:['food','cook','eat','ramen'], tech:['code','tech','build','program','hack'],
    outdoors:['outside','hike','lake','nature'], film:['movie','film','watch','netflix'],
    fashion:['fashion','style','clothes'], academics:['study','class','learn','library'],
  };
  const detected = cats.filter(c => (kw[c]||[]).some(w => tl.includes(w)));
  const interests = [...new Set([...(hobbies || []), ...detected])].filter(i => cats.includes(i));

  return {
    energy_level: tl.match(/excit|love|hype|awesome/) ? 0.8 : tl.match(/chill|quiet|relax/) ? 0.3 : 0.55,
    introvert_extrovert_score: tl.match(/people|friend|party|hang/) ? 0.8 : tl.match(/alone|quiet|intro/) ? 0.25 : 0.5,
    interests: interests.length ? interests : (hobbies || ['food']),
    tone_warmth: 0.7,
    humor_score: 0.55,
    summary: `Friendly ${hobbies?.length ? hobbies.slice(0,2).join(' and ') + ' enthusiast' : 'student'} looking to connect with their dorm neighbors`,
  };
}

function mockMeetup() {
  const ideas = [
    "Grab cheese curds at the Memorial Union tonight at 8pm — your vibe alignment is off the charts!",
    "Meet at the Terrace chairs tomorrow at sunset — same energy, no excuses. Bring a speaker.",
    "Common room on your floor tonight at 9pm — board games or just vibes, your call.",
    "Study at College Library tomorrow at 3pm, then Morris Ramen after — fuel the brain, then the soul.",
    "Lakeshore Path walk tomorrow at 4pm — fresh air and good conversation, the algorithm has spoken.",
  ];
  return ideas[Math.floor(Math.random() * ideas.length)];
}

function mockSuggestions(user, neighbors) {
  return neighbors.slice(0, 3).map(n => {
    const shared = (user.hobbies || []).filter(h => (n.hobbies || []).includes(h));
    const reason = shared.length
      ? `You both love ${shared.join(' and ')} — definitely worth saying hi!`
      : `Different vibes but ${n.major} + ${user.major} is a combo that just works.`;
    return { room: n.room, reason };
  });
}
