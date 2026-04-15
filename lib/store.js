const DORM_FLOORS = {
  'Witte Hall': 12,
  'Sellery Hall': 12,
  'Chadbourne Hall': 5,
  'Dejope Hall': 8,
  'Ogg Hall': 8,
  'Smith Hall': 6,
  'Adams Hall': 4,
  'Tripp Hall': 4,
};

if (!globalThis.__helloNeighbourStore) {
  globalThis.__helloNeighbourStore = {
    users: new Map(),
    resonations: new Map(),
    messages: [],
    matches: new Map(),
    typing: new Map(),
    reactions: new Map(),
    readReceipts: new Map(),
  };

  const seed = [
    // ── Witte Hall ──
    {
      id: 'mock1', name: 'Jake', dorm: 'Witte Hall', floor: 2, room: '204',
      major: 'Music Education', year: 'Sophomore',
      hobbies: ['music', 'food', 'film'],
      summary: 'Chill, creative type who stays up late producing beats and is always down for late night ramen',
      features: { energy_level: 0.4, introvert_extrovert_score: 0.3, interests: ['music','food','film'], tone_warmth: 0.8, humor_score: 0.6 },
      audioSeed: 1,
    },
    {
      id: 'mock2', name: 'Tyler', dorm: 'Witte Hall', floor: 2, room: '212',
      major: 'Kinesiology', year: 'Junior',
      hobbies: ['sports', 'outdoors', 'food'],
      summary: 'High energy sports fan who watches every Badgers game and is always looking for someone to throw a frisbee with',
      features: { energy_level: 0.9, introvert_extrovert_score: 0.95, interests: ['sports','outdoors','food'], tone_warmth: 0.7, humor_score: 0.8 },
      audioSeed: 2,
    },
    {
      id: 'mock3', name: 'Anika', dorm: 'Witte Hall', floor: 2, room: '208',
      major: 'Psychology', year: 'Freshman',
      hobbies: ['art', 'music', 'academics'],
      summary: 'Late-night journaler who makes playlists for every mood and is looking for someone to visit the Chazen with',
      features: { energy_level: 0.45, introvert_extrovert_score: 0.35, interests: ['art','music','academics'], tone_warmth: 0.85, humor_score: 0.5 },
      audioSeed: 4,
    },
    {
      id: 'mock4', name: 'Sofia', dorm: 'Witte Hall', floor: 3, room: '305',
      major: 'Philosophy', year: 'Junior',
      hobbies: ['academics', 'food', 'film'],
      summary: 'Will debate you on anything and everything, but always over good coffee — documentary nights are her love language',
      features: { energy_level: 0.55, introvert_extrovert_score: 0.6, interests: ['academics','food','film'], tone_warmth: 0.7, humor_score: 0.75 },
      audioSeed: 5,
    },
    {
      id: 'mock5', name: 'Marcus', dorm: 'Witte Hall', floor: 3, room: '311',
      major: 'Political Science', year: 'Senior',
      hobbies: ['sports', 'academics', 'food'],
      summary: 'Club president who knows every event on campus and will drag you to all of them — in the best way',
      features: { energy_level: 0.85, introvert_extrovert_score: 0.9, interests: ['sports','academics','food'], tone_warmth: 0.75, humor_score: 0.7 },
      audioSeed: 6,
    },
    // ── Sellery Hall ──
    {
      id: 'mock6', name: 'Priya', dorm: 'Sellery Hall', floor: 2, room: '203',
      major: 'Biochemistry', year: 'Freshman',
      hobbies: ['academics', 'food', 'music'],
      summary: 'Pre-med grinder who stress-bakes at midnight and shares the results with everyone on the floor',
      features: { energy_level: 0.65, introvert_extrovert_score: 0.5, interests: ['academics','food','music'], tone_warmth: 0.9, humor_score: 0.6 },
      audioSeed: 7,
    },
    {
      id: 'mock7', name: 'Ethan', dorm: 'Sellery Hall', floor: 2, room: '208',
      major: 'Computer Science', year: 'Freshman',
      hobbies: ['tech', 'gaming', 'film'],
      summary: 'Quietly ambitious CS student who loves building random projects at 2am and will talk your ear off about video games',
      features: { energy_level: 0.6, introvert_extrovert_score: 0.5, interests: ['tech','gaming','film'], tone_warmth: 0.75, humor_score: 0.7 },
      audioSeed: 3,
    },
    {
      id: 'mock8', name: 'Nina', dorm: 'Sellery Hall', floor: 2, room: '211',
      major: 'Dance', year: 'Sophomore',
      hobbies: ['music', 'outdoors', 'fashion'],
      summary: 'Always has earbuds in, always moving — catch her practicing in the hallway or running the Lakeshore Path at dawn',
      features: { energy_level: 0.8, introvert_extrovert_score: 0.6, interests: ['music','outdoors','fashion'], tone_warmth: 0.7, humor_score: 0.55 },
      audioSeed: 10,
    },
    {
      id: 'mock9', name: 'Zoe', dorm: 'Sellery Hall', floor: 4, room: '407',
      major: 'Communication Arts', year: 'Sophomore',
      hobbies: ['film', 'art', 'fashion'],
      summary: 'Film student who rates every movie she watches and is always looking for someone to hit up Sundance Cinemas with',
      features: { energy_level: 0.5, introvert_extrovert_score: 0.55, interests: ['film','art','fashion'], tone_warmth: 0.8, humor_score: 0.65 },
      audioSeed: 8,
    },
    {
      id: 'mock10', name: 'Kai', dorm: 'Sellery Hall', floor: 4, room: '402',
      major: 'Environmental Science', year: 'Junior',
      hobbies: ['outdoors', 'tech', 'food'],
      summary: 'Camp counselor energy — knows every trail within 50 miles and cooks a mean camp stove meal',
      features: { energy_level: 0.7, introvert_extrovert_score: 0.65, interests: ['outdoors','tech','food'], tone_warmth: 0.85, humor_score: 0.7 },
      audioSeed: 11,
    },
    // ── Chadbourne Hall ──
    {
      id: 'mock11', name: 'Leo', dorm: 'Chadbourne Hall', floor: 2, room: '206',
      major: 'Art', year: 'Sophomore',
      hobbies: ['art', 'outdoors', 'music'],
      summary: 'Sketchbook always in hand, equally happy drawing in the Arboretum or jamming in the common room',
      features: { energy_level: 0.4, introvert_extrovert_score: 0.4, interests: ['art','outdoors','music'], tone_warmth: 0.85, humor_score: 0.55 },
      audioSeed: 9,
    },
    {
      id: 'mock12', name: 'Deepa', dorm: 'Chadbourne Hall', floor: 2, room: '210',
      major: 'Data Science', year: 'Freshman',
      hobbies: ['tech', 'gaming', 'academics'],
      summary: 'Hackathon regular who debugs code like a detective — also unbeatable at Mario Kart in the common room',
      features: { energy_level: 0.7, introvert_extrovert_score: 0.55, interests: ['tech','gaming','academics'], tone_warmth: 0.7, humor_score: 0.8 },
      audioSeed: 12,
    },
  ];

  seed.forEach(u => globalThis.__helloNeighbourStore.users.set(u.id, { ...u, createdAt: Date.now() }));
}

const store = globalThis.__helloNeighbourStore;

export { DORM_FLOORS };

export function getAllUsers() {
  return [...store.users.values()];
}

export function getUser(id) {
  return store.users.get(id) || null;
}

export function getDormUsers(dorm) {
  return getAllUsers().filter(u => u.dorm === dorm);
}

export function getFloorUsers(dorm, floor) {
  return getAllUsers().filter(u => u.dorm === dorm && u.floor === floor);
}

export function addUser(user) {
  store.users.set(user.id, { ...user, createdAt: Date.now() });
  return user;
}

export function addResonation(fromId, toId) {
  store.resonations.set(`${fromId}->${toId}`, true);
  if (store.resonations.has(`${toId}->${fromId}`)) {
    const matchKey = [fromId, toId].sort().join('::');
    if (!store.matches.has(matchKey)) {
      store.matches.set(matchKey, { users: [fromId, toId], matchedAt: Date.now() });
    }
    return { match: true, matchedUser: store.users.get(toId) };
  }
  return { match: false };
}

export function isMockUser(id) {
  return id.startsWith('mock');
}

export function getMatchesForUser(userId) {
  const results = [];
  for (const [, match] of store.matches) {
    if (match.users.includes(userId)) {
      const otherId = match.users.find(id => id !== userId);
      const other = store.users.get(otherId);
      if (other) results.push({ ...other, matchedAt: match.matchedAt });
    }
  }
  return results.sort((a, b) => b.matchedAt - a.matchedAt);
}

export function addMessage(fromId, toId, text) {
  const msg = { id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, fromId, toId, text, createdAt: Date.now() };
  store.messages.push(msg);
  return msg;
}

export function getMessages(userId1, userId2) {
  return store.messages.filter(
    m => (m.fromId === userId1 && m.toId === userId2) || (m.fromId === userId2 && m.toId === userId1)
  ).sort((a, b) => a.createdAt - b.createdAt).map(m => ({
    ...m,
    reactions: store.reactions.get(m.id) || [],
  }));
}

export function getLastMessage(userId1, userId2) {
  const msgs = store.messages.filter(
    m => (m.fromId === userId1 && m.toId === userId2) || (m.fromId === userId2 && m.toId === userId1)
  );
  return msgs.length ? msgs[msgs.length - 1] : null;
}

export function getUnreadCount(userId, fromId) {
  const lastRead = store.readReceipts.get(`${userId}::${fromId}`) || 0;
  return store.messages.filter(
    m => m.fromId === fromId && m.toId === userId && m.createdAt > lastRead
  ).length;
}

export function markRead(userId, fromId) {
  store.readReceipts.set(`${userId}::${fromId}`, Date.now());
}

export function setTyping(userId, toId, isTyping) {
  const key = `${userId}->${toId}`;
  if (isTyping) {
    store.typing.set(key, Date.now());
  } else {
    store.typing.delete(key);
  }
}

export function isTyping(userId, toId) {
  const key = `${userId}->${toId}`;
  const ts = store.typing.get(key);
  if (!ts) return false;
  if (Date.now() - ts > 5000) {
    store.typing.delete(key);
    return false;
  }
  return true;
}

export function addReaction(messageId, userId, emoji) {
  const existing = store.reactions.get(messageId) || [];
  const already = existing.findIndex(r => r.userId === userId && r.emoji === emoji);
  if (already >= 0) {
    existing.splice(already, 1);
  } else {
    existing.push({ userId, emoji, createdAt: Date.now() });
  }
  store.reactions.set(messageId, existing);
  return existing;
}

export function getFloorStats(dorm) {
  const users = [...store.users.values()].filter(u => u.dorm === dorm);
  const resonationCount = [...store.resonations.keys()].length;
  const matchCount = store.matches.size;
  const messageCount = store.messages.length;
  const hobbyCounts = {};
  users.forEach(u => (u.hobbies || []).forEach(h => { hobbyCounts[h] = (hobbyCounts[h] || 0) + 1; }));
  const topHobbies = Object.entries(hobbyCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const majorCounts = {};
  users.forEach(u => { if (u.major) majorCounts[u.major] = (majorCounts[u.major] || 0) + 1; });
  const topMajors = Object.entries(majorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return {
    totalUsers: users.length,
    resonationCount,
    matchCount,
    messageCount,
    topHobbies,
    topMajors,
    floorBreakdown: users.reduce((acc, u) => {
      acc[u.floor] = (acc[u.floor] || 0) + 1;
      return acc;
    }, {}),
  };
}
