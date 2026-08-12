export const FORMULATION_AXIS_IDS = [
  "evidenceValues",
  "individualSystemic",
  "deliberationAction",
  "accessibleTechnical",
];

export function validateVector(vector) {
  for (const axisId of FORMULATION_AXIS_IDS) {
    const value = vector?.[axisId];
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new RangeError(`L'axe ${axisId} doit être compris entre 0 et 100.`);
    }
  }
}

export function rankFormulationProfiles(profiles, target, limit = profiles.length) {
  validateVector(target);
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError("La limite doit être positive.");

  return profiles
    .map((profile) => {
      validateVector(profile.values);
      const axisDistances = Object.fromEntries(
        FORMULATION_AXIS_IDS.map((axisId) => [axisId, Math.abs(profile.values[axisId] - target[axisId])]),
      );
      const squaredDistance = FORMULATION_AXIS_IDS.reduce(
        (sum, axisId) => sum + axisDistances[axisId] ** 2,
        0,
      );
      const normalizedDistance = Math.sqrt(squaredDistance / FORMULATION_AXIS_IDS.length) / 100;
      const similarity = Math.max(0, Math.round((1 - normalizedDistance) * 100));
      const closestAxes = [...FORMULATION_AXIS_IDS]
        .sort((left, right) => axisDistances[left] - axisDistances[right])
        .slice(0, 2);

      return { ...profile, similarity, axisDistances, closestAxes };
    })
    .sort((left, right) => right.similarity - left.similarity || left.argumentId.localeCompare(right.argumentId))
    .slice(0, limit);
}
