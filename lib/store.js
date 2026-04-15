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

  const mock = [
    {
      id: 'mock1', name: 'Anonymous', dorm: 'Witte Hall', floor: 2, room: '204',
      major: 'Music Performance', year: 'Sophomore', hobbies: ['music', 'food', 'film'],
      summary: "Chill, creative type who stays up late producing beats and is always down for late night ramen",
      features: { energy_level: 0.4, introvert_extrovert_score: 0.3, interests: ['music','food','film'], tone_warmth: 0.8, humor_score: 0.6 },
      audioSeed: 1, createdAt: Date.now(),
    },
    {
      id: 'mock2', name: 'Anonymous', dorm: 'Witte Hall', floor: 2, room: '212',
      major: 'Kinesiology', year: 'Junior', hobbies: ['sports', 'outdoors', 'food'],
      summary: "High energy sports fan who watches every Badgers game and is always looking for someone to throw a frisbee with",
      features: { energy_level: 0.9, introvert_extrovert_score: 0.95, interests: ['sports','outdoors','food'], tone_warmth: 0.7, humor_score: 0.8 },
      audioSeed: 2, createdAt: Date.now(),
    },
    {
      id: 'mock3', name: 'Anonymous', dorm: 'Witte Hall', floor: 1, room: '108',
      major: 'Computer Science', year: 'Freshman', hobbies: ['tech', 'gaming', 'film'],
      summary: "Quietly ambitious CS student who loves building random projects at 2am and will talk your ear off about video games",
      features: { energy_level: 0.6, introvert_extrovert_score: 0.5, interests: ['tech','gaming','film'], tone_warmth: 0.75, humor_score: 0.7 },
      audioSeed: 3, createdAt: Date.now(),
    },
  ];
  mock.forEach(u => globalThis.__helloNeighbourStore.users.set(u.id, u));
}

const store = globalThis.__helloNeighbourStore;

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
