function assertFiniteNonNegative(value, label) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} doit être un nombre positif ou nul.`);
  }
}

function assertShares(shares) {
  if (!Array.isArray(shares) || shares.length < 2) {
    throw new Error("Au moins deux proportions sont requises.");
  }
  for (const share of shares) {
    if (!Number.isFinite(share) || share < 0 || share > 1) {
      throw new Error("Chaque proportion doit être comprise entre 0 et 1.");
    }
  }
}

export function estimateIndependentIntersection(total, shares) {
  assertFiniteNonNegative(total, "Le total");
  assertShares(shares);
  return total * shares.reduce((product, share) => product * share, 1);
}

export function frechetBounds(total, shares) {
  assertFiniteNonNegative(total, "Le total");
  assertShares(shares);
  const lowerShare = Math.max(0, shares.reduce((sum, share) => sum + share, 0) - (shares.length - 1));
  const upperShare = Math.min(...shares);
  return { lower: total * lowerShare, upper: total * upperShare };
}

export function roundToUnit(value, unit = 1) {
  assertFiniteNonNegative(value, "La valeur");
  if (!Number.isFinite(unit) || unit <= 0) throw new Error("L'unité doit être strictement positive.");
  return Math.round(value / unit) * unit;
}

export function signedDifferencePercent(estimate, observation) {
  assertFiniteNonNegative(estimate, "L'estimation");
  if (!Number.isFinite(observation) || observation <= 0) {
    throw new Error("L'observation doit être strictement positive.");
  }
  return ((estimate - observation) / observation) * 100;
}
