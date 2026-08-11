import populationData from "../../content/population.json";

export type DimensionStatus = "active" | "planned" | "research-only" | "restricted";

export type PopulationCategory = {
  id: string;
  label: string;
  order: number;
};

export type PopulationDimension = {
  id: string;
  version: string;
  family: string;
  label: string;
  status: DimensionStatus;
  evidenceStatus: string;
  usage: string;
  definition: string;
  limitations: string[];
  categories: PopulationCategory[];
};

export type PopulationObservation = {
  categories: Record<string, string>;
  count: number;
};

export type PopulationDataset = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt: string;
  measuredAt: string;
  accessedAt: string;
  geography: { id: string; label: string };
  status: string;
  unit: string;
  roundingUnit: number;
  dimensionIds: string[];
  total: number;
  marginals: Record<string, Record<string, number>>;
  observations: PopulationObservation[];
  methodologyNote: string;
};

export type PopulationCatalog = {
  schemaVersion: number;
  updatedAt: string;
  policy: {
    aggregateOnly: boolean;
    individualProfilesAllowed: boolean;
    sensitivePoliticalTargetingAllowed: boolean;
    uncertaintyRequiredForEstimates: boolean;
  };
  dimensions: PopulationDimension[];
  datasets: PopulationDataset[];
};

export const population = populationData as unknown as PopulationCatalog;

export function getDimension(id: string) {
  const dimension = population.dimensions.find((item) => item.id === id);
  if (!dimension) throw new Error(`Dimension inconnue : ${id}`);
  return dimension;
}

export function getObservationCount(
  dataset: PopulationDataset,
  categories: Record<string, string>,
) {
  const observation = dataset.observations.find((item) =>
    Object.entries(categories).every(([dimensionId, categoryId]) =>
      item.categories[dimensionId] === categoryId,
    ),
  );
  if (!observation) throw new Error("Croisement absent du jeu de données.");
  return observation.count;
}

export function formatPopulation(value: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(value));
}

export function formatPercent(value: number, digits = 1) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}
