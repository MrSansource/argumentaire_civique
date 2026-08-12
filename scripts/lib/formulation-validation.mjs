import { FORMULATION_AXIS_IDS, validateVector } from "../../src/lib/formulation-ranking.mjs";

export function validateFormulationCatalog(catalog, argumentIds) {
  const errors = [];
  const axes = Array.isArray(catalog.axes) ? catalog.axes : [];
  const profiles = Array.isArray(catalog.profiles) ? catalog.profiles : [];

  if (!catalog.policy?.userControlled || !catalog.policy?.scoresAreEditorial) {
    errors.push("La politique doit rendre les réglages explicites et les scores éditoriaux.");
  }
  if (catalog.policy?.individualInferenceAllowed !== false || catalog.policy?.sensitiveTargetingAllowed !== false) {
    errors.push("La politique doit interdire l'inférence individuelle et le ciblage sensible.");
  }
  if (catalog.policy?.persistSelections !== false) {
    errors.push("Le prototype ne doit pas persister les sélections.");
  }

  const axisIds = axes.map((axis) => axis.id);
  if (new Set(axisIds).size !== axisIds.length) errors.push("Les axes doivent avoir des identifiants uniques.");
  for (const axisId of FORMULATION_AXIS_IDS) {
    const axis = axes.find((item) => item.id === axisId);
    if (!axis?.label || !axis.lowLabel || !axis.highLabel || !axis.description) {
      errors.push(`Axe incomplet : ${axisId}.`);
    }
  }

  const seenArguments = new Set();
  for (const profile of profiles) {
    if (!argumentIds.has(profile.argumentId)) errors.push(`Profil lié à un argument inconnu : ${profile.argumentId}.`);
    if (seenArguments.has(profile.argumentId)) errors.push(`Profil dupliqué : ${profile.argumentId}.`);
    seenArguments.add(profile.argumentId);
    try {
      validateVector(profile.values);
    } catch (error) {
      errors.push(`${profile.argumentId} : ${error.message}`);
    }
    if (!profile.editorialNote) errors.push(`Note éditoriale absente : ${profile.argumentId}.`);
  }

  for (const argumentId of argumentIds) {
    if (!seenArguments.has(argumentId)) errors.push(`Argument sans profil de formulation : ${argumentId}.`);
  }
  return errors;
}
