import formulationData from "../../content/formulation-profiles.json";
import type { FormulationAxisId, FormulationProfile } from "./formulation-ranking.mjs";

export type FormulationAxis = {
  id: FormulationAxisId;
  label: string;
  lowLabel: string;
  highLabel: string;
  description: string;
};

export const formulationCatalog = formulationData as unknown as {
  schemaVersion: number;
  updatedAt: string;
  axes: FormulationAxis[];
  profiles: FormulationProfile[];
};
