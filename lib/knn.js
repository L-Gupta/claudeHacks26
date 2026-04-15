const INTEREST_CATS = ['music','sports','gaming','art','food','tech','outdoors','film','fashion','academics'];

const DIMENSION_LABELS = {
  energy_level: 'Energy',
  introvert_extrovert_score: 'Social Style',
  tone_warmth: 'Warmth',
  humor_score: 'Humor',
};

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

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

// Max possible Euclidean distance in the 14-dim space (all dims 0→1)
const MAX_DIST = Math.sqrt(14);

export function compatibilityScore(featuresA, featuresB) {
  if (!featuresA || !featuresB) return null;
  const vecA = encodeVector(featuresA);
  const vecB = encodeVector(featuresB);

  const euclidNorm = 1 - (euclidean(vecA, vecB) / MAX_DIST);
  const cosine = (cosineSimilarity(vecA, vecB) + 1) / 2;

  // Weighted blend: 60% euclidean similarity, 40% cosine
  const raw = euclidNorm * 0.6 + cosine * 0.4;
  return Math.round(Math.max(0, Math.min(100, raw * 100)));
}

export function compatibilityBreakdown(featuresA, featuresB) {
  if (!featuresA || !featuresB) return null;
  const sharedInterests = (featuresA.interests || []).filter(
    i => (featuresB.interests || []).includes(i)
  );
  const dims = {};
  for (const [key, label] of Object.entries(DIMENSION_LABELS)) {
    const a = featuresA[key] ?? 0.5;
    const b = featuresB[key] ?? 0.5;
    dims[label] = Math.round((1 - Math.abs(a - b)) * 100);
  }
  return { sharedInterests, dimensions: dims, interestOverlap: sharedInterests.length };
}

export function knnRank(userFeatures, candidates, k = 3) {
  const userVec = encodeVector(userFeatures);
  return candidates
    .map(c => ({ user: c, dist: euclidean(userVec, encodeVector(c.features)) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, k)
    .map(d => d.user);
}

export function knnRankWithScores(userFeatures, candidates, k = 3) {
  const userVec = encodeVector(userFeatures);
  return candidates
    .map(c => {
      const dist = euclidean(userVec, encodeVector(c.features));
      const score = compatibilityScore(userFeatures, c.features);
      return { user: c, dist, score };
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, k);
}

export { INTEREST_CATS, DIMENSION_LABELS };
