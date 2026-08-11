export type ArgumentSpaceEstimate = {
  dimensionCount: number;
  gridCount: number;
  categorySum: number;
  cellCount: number;
  themeCount: number;
  unorderedThemeVariants: number;
  orderedDistinctThemeVariants: number;
  statedThemeVariants: number;
  unorderedArgumentSlots: number;
  orderedDistinctArgumentSlots: number;
  statedArgumentSlots: number;
};

export function parseDimensionSizes(value: string): number[];
export function estimateArgumentSpace(
  dimensionSizes: number[],
  themeCount: number,
): ArgumentSpaceEstimate;
