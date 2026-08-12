import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { rankFormulationProfiles } from "../src/lib/formulation-ranking.mjs";
import { validateFormulationCatalog } from "../scripts/lib/formulation-validation.mjs";

const catalog = JSON.parse(await readFile(new URL("../content/formulation-profiles.json", import.meta.url), "utf8"));
const corpus = JSON.parse(await readFile(new URL("../content/corpus.json", import.meta.url), "utf8"));
const argumentIds = new Set(corpus.arguments.map((argument) => argument.id));

test("les profils couvrent tous les arguments sans ciblage individuel", () => {
  assert.deepEqual(validateFormulationCatalog(catalog, argumentIds), []);
});

test("classe un besoin personnel orienté valeurs et action", () => {
  const results = rankFormulationProfiles(catalog.profiles, {
    evidenceValues: 90,
    individualSystemic: 10,
    deliberationAction: 80,
    accessibleTechnical: 20,
  }, 3);

  assert.equal(results[0].argumentId, "argument-agir-sans-attendre-etat-ideal");
  assert.ok(results[0].similarity > results[1].similarity);
});

test("classe un diagnostic matériel détaillé", () => {
  const results = rankFormulationProfiles(catalog.profiles, {
    evidenceValues: 10,
    individualSystemic: 80,
    deliberationAction: 25,
    accessibleTechnical: 80,
  });

  assert.equal(results[0].argumentId, "argument-tester-materiel-avant-psychologiser");
  assert.deepEqual(Object.keys(results[0].axisDistances).sort(), catalog.axes.map((axis) => axis.id).sort());
});
