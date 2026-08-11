function assertPositiveInteger(value, label) {
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(`${label} doit être un entier positif.`);
  }
}

export function parseDimensionSizes(value) {
  const sizes = value
    .split(/[\s,;×x]+/u)
    .filter(Boolean)
    .map(Number);

  if (sizes.length < 2) {
    throw new RangeError("Au moins deux nomenclatures sont nécessaires.");
  }

  sizes.forEach((size, index) => assertPositiveInteger(size, `La taille ${index + 1}`));
  return sizes;
}

export function estimateArgumentSpace(dimensionSizes, themeCount) {
  if (!Array.isArray(dimensionSizes) || dimensionSizes.length < 2) {
    throw new RangeError("Au moins deux nomenclatures sont nécessaires.");
  }

  dimensionSizes.forEach((size, index) =>
    assertPositiveInteger(size, `La taille ${index + 1}`),
  );
  assertPositiveInteger(themeCount, "Le nombre de thèmes");

  const dimensionCount = dimensionSizes.length;
  const gridCount = (dimensionCount * (dimensionCount - 1)) / 2;
  const categorySum = dimensionSizes.reduce((sum, size) => sum + size, 0);
  const squareSum = dimensionSizes.reduce((sum, size) => sum + size ** 2, 0);
  const cellCount = (categorySum ** 2 - squareSum) / 2;
  const unorderedThemeVariants = themeCount + (themeCount * (themeCount - 1)) / 2;
  const orderedDistinctThemeVariants = themeCount + themeCount * (themeCount - 1);
  const statedThemeVariants = themeCount + themeCount ** 2;

  return {
    dimensionCount,
    gridCount,
    categorySum,
    cellCount,
    themeCount,
    unorderedThemeVariants,
    orderedDistinctThemeVariants,
    statedThemeVariants,
    unorderedArgumentSlots: cellCount * unorderedThemeVariants,
    orderedDistinctArgumentSlots: cellCount * orderedDistinctThemeVariants,
    statedArgumentSlots: cellCount * statedThemeVariants,
  };
}
