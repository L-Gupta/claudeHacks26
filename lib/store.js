if (!globalThis.__helloNeighbourStore) {
  globalThis.__helloNeighbourStore = {
    users: new Map(),
    resonations: new Map(),
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
    return { match: true, matchedUser: store.users.get(toId) };
  }
  return { match: false };
}

export function isMockUser(id) {
  return id.startsWith('mock');
}
