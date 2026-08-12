export type FormulationAxisId =
  | "evidenceValues"
  | "individualSystemic"
  | "deliberationAction"
  | "accessibleTechnical";

export type FormulationVector = Record<FormulationAxisId, number>;
export type FormulationProfile = {
  argumentId: string;
  values: FormulationVector;
  editorialNote: string;
};
export type RankedFormulationProfile = FormulationProfile & {
  similarity: number;
  axisDistances: Record<FormulationAxisId, number>;
  closestAxes: FormulationAxisId[];
};

export const FORMULATION_AXIS_IDS: FormulationAxisId[];
export function validateVector(vector: FormulationVector): void;
export function rankFormulationProfiles(
  profiles: FormulationProfile[],
  target: FormulationVector,
  limit?: number,
): RankedFormulationProfile[];
