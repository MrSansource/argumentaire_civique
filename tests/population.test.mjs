import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  estimateIndependentIntersection,
  frechetBounds,
  roundToUnit,
  signedDifferencePercent,
} from "../src/lib/population-estimation.mjs";
import { validatePopulationCatalog } from "../scripts/lib/population-validation.mjs";

const catalog = JSON.parse(
  await readFile(new URL("../content/population.json", import.meta.url), "utf8"),
);

test("le catalogue de population respecte les invariants", () => {
  assert.deepEqual(validatePopulationCatalog(catalog), []);
});

test("calcule une intersection sous hypothèse d'indépendance", () => {
  const total = 69_082_000;
  const estimate = estimateIndependentIntersection(total, [7_686_000 / total, 35_531_000 / total]);

  assert.equal(roundToUnit(estimate, 1_000), 3_953_000);
  assert.ok(signedDifferencePercent(estimate, 4_541_000) < -12);
});

test("calcule les bornes de Fréchet sans supposer l'indépendance", () => {
  const total = 1_000;
  const bounds = frechetBounds(total, [0.7, 0.6]);
  assert.equal(Math.round(bounds.lower), 300);
  assert.equal(bounds.upper, 600);
});

test("refuse les proportions invalides", () => {
  assert.throws(() => estimateIndependentIntersection(100, [0.5, 1.2]), /comprise entre 0 et 1/);
});

test("détecte une cellule de catégorie inconnue", () => {
  const invalidCatalog = structuredClone(catalog);
  invalidCatalog.datasets[0].observations[0].categories["age-group-2026"] = "inconnu";

  assert.match(validatePopulationCatalog(invalidCatalog).join("\n"), /catégorie inconnue/);
});
