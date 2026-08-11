import assert from "node:assert/strict";
import test from "node:test";
import { estimateArgumentSpace, parseDimensionSizes } from "../src/lib/scale-estimator.mjs";

test("corrige le calcul initial des croisements", () => {
  const sizes = [2, 2, 2, 2, 2, 5, 5, 5, 10, 16];
  const estimate = estimateArgumentSpace(sizes, 7);

  assert.equal(estimate.gridCount, 45);
  assert.equal(estimate.cellCount, 1_075);
  assert.equal(estimate.unorderedThemeVariants, 28);
  assert.equal(estimate.unorderedArgumentSlots, 30_100);
  assert.equal(estimate.statedThemeVariants, 56);
  assert.equal(estimate.statedArgumentSlots, 60_200);
});

test("analyse une liste de tailles lisible", () => {
  assert.deepEqual(parseDimensionSizes("2, 5 × 10; 16"), [2, 5, 10, 16]);
});

test("refuse une nomenclature ou un thème invalide", () => {
  assert.throws(() => parseDimensionSizes("2"), /Au moins deux/);
  assert.throws(() => estimateArgumentSpace([2, 0], 7), /entier positif/);
  assert.throws(() => estimateArgumentSpace([2, 5], 0), /entier positif/);
});
