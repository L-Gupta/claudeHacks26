const INTEREST_CATS = ['music','sports','gaming','art','food','tech','outdoors','film','fashion','academics'];

export function encodeVector(features) {
  const ih = INTEREST_CATS.map(c => (features.interests || []).includes(c) ? 1 : 0);
  return [
    features.energy_level || 0.5,
    features.introvert_extrovert_score || 0.5,
    ...ih,
    features.tone_warmth || 0.5,
    features.humor_score || 0.5,
  ];
}

function euclidean(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
  return Math.sqrt(s);
}

export function knnRank(userFeatures, candidates, k = 3) {
  const userVec = encodeVector(userFeatures);
  return candidates
    .map(c => ({ user: c, dist: euclidean(userVec, encodeVector(c.features)) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, k)
    .map(d => d.user);
}

export { INTEREST_CATS };
