const ALLOWED_DIMENSION_STATUSES = new Set(["active", "planned", "research-only", "restricted"]);

export function validatePopulationCatalog(catalog) {
  const errors = [];
  const dimensions = Array.isArray(catalog.dimensions) ? catalog.dimensions : [];
  const datasets = Array.isArray(catalog.datasets) ? catalog.datasets : [];
  if (!Array.isArray(catalog.dimensions)) errors.push("dimensions doit être un tableau.");
  if (!Array.isArray(catalog.datasets)) errors.push("datasets doit être un tableau.");
  if (!catalog.policy?.aggregateOnly || catalog.policy?.individualProfilesAllowed !== false) {
    errors.push("La politique doit imposer des données agrégées et interdire les profils individuels.");
  }

  const dimensionById = new Map();
  for (const dimension of dimensions) {
    if (!dimension.id || dimensionById.has(dimension.id)) {
      errors.push(`Dimension absente ou dupliquée : ${dimension.id ?? "sans id"}.`);
      continue;
    }
    dimensionById.set(dimension.id, dimension);
    if (!ALLOWED_DIMENSION_STATUSES.has(dimension.status)) {
      errors.push(`Dimension ${dimension.id} : statut invalide ${dimension.status}.`);
    }
    if (!dimension.version || !dimension.definition || !dimension.limitations?.length) {
      errors.push(`Dimension ${dimension.id} : version, définition ou limites absentes.`);
    }
    const categoryIds = new Set();
    for (const category of dimension.categories ?? []) {
      if (!category.id || categoryIds.has(category.id)) {
        errors.push(`Dimension ${dimension.id} : catégorie absente ou dupliquée.`);
      }
      categoryIds.add(category.id);
    }
  }

  const datasetIds = new Set();
  for (const dataset of datasets) {
    if (!dataset.id || datasetIds.has(dataset.id)) errors.push(`Jeu de données dupliqué : ${dataset.id}.`);
    datasetIds.add(dataset.id);
    try {
      new URL(dataset.url);
    } catch {
      errors.push(`Jeu de données ${dataset.id} : URL invalide.`);
    }
    if (!Number.isInteger(dataset.roundingUnit) || dataset.roundingUnit <= 0) {
      errors.push(`Jeu de données ${dataset.id} : unité d'arrondi invalide.`);
    }
    if (!Number.isFinite(dataset.total) || dataset.total <= 0) {
      errors.push(`Jeu de données ${dataset.id} : total invalide.`);
    }

    const categoryIdsByDimension = new Map();
    for (const dimensionId of dataset.dimensionIds ?? []) {
      const dimension = dimensionById.get(dimensionId);
      if (!dimension) {
        errors.push(`Jeu de données ${dataset.id} : dimension inconnue ${dimensionId}.`);
        continue;
      }
      if (dimension.status !== "active") {
        errors.push(`Jeu de données ${dataset.id} : dimension non active ${dimensionId}.`);
      }
      categoryIdsByDimension.set(dimensionId, new Set(dimension.categories.map((item) => item.id)));
    }

    const observationKeys = new Set();
    for (const observation of dataset.observations ?? []) {
      const keyParts = [];
      for (const dimensionId of dataset.dimensionIds ?? []) {
        const categoryId = observation.categories?.[dimensionId];
        if (!categoryIdsByDimension.get(dimensionId)?.has(categoryId)) {
          errors.push(`Jeu de données ${dataset.id} : catégorie inconnue ${dimensionId}/${categoryId}.`);
        }
        keyParts.push(`${dimensionId}:${categoryId}`);
      }
      const key = keyParts.join("|");
      if (observationKeys.has(key)) errors.push(`Jeu de données ${dataset.id} : cellule dupliquée ${key}.`);
      observationKeys.add(key);
      if (!Number.isFinite(observation.count) || observation.count < 0) {
        errors.push(`Jeu de données ${dataset.id} : effectif invalide pour ${key}.`);
      }
    }

    const expectedCells = [...categoryIdsByDimension.values()].reduce(
      (product, categoryIds) => product * categoryIds.size,
      1,
    );
    if (dataset.observations?.length !== expectedCells) {
      errors.push(`Jeu de données ${dataset.id} : ${dataset.observations?.length ?? 0} cellules au lieu de ${expectedCells}.`);
    }

    for (const dimensionId of dataset.dimensionIds ?? []) {
      const marginals = dataset.marginals?.[dimensionId];
      if (!marginals) {
        errors.push(`Jeu de données ${dataset.id} : marges absentes pour ${dimensionId}.`);
        continue;
      }
      for (const categoryId of categoryIdsByDimension.get(dimensionId) ?? []) {
        const observedSum = (dataset.observations ?? [])
          .filter((item) => item.categories[dimensionId] === categoryId)
          .reduce((sum, item) => sum + item.count, 0);
        const publishedMarginal = marginals[categoryId];
        const contributingCells = (dataset.observations ?? []).filter(
          (item) => item.categories[dimensionId] === categoryId,
        ).length;
        const tolerance = (dataset.roundingUnit * contributingCells) / 2;
        if (!Number.isFinite(publishedMarginal) || Math.abs(observedSum - publishedMarginal) > tolerance) {
          errors.push(`Jeu de données ${dataset.id} : marge incohérente ${dimensionId}/${categoryId}.`);
        }
      }
    }
  }

  return errors;
}
