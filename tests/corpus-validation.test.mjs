import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { validateCorpus } from "../scripts/lib/corpus-validation.mjs";

const corpus = JSON.parse(
  await readFile(new URL("../content/corpus.json", import.meta.url), "utf8"),
);

test("le corpus publié respecte les invariants éditoriaux", () => {
  assert.deepEqual(validateCorpus(corpus), []);
});

test("une affirmation sans segment est refusée", () => {
  const invalidCorpus = structuredClone(corpus);
  invalidCorpus.claims[0].segmentIds = [];

  assert.match(validateCorpus(invalidCorpus).join("\n"), /au moins un segment est requis/);
});

test("un extrait trop long est refusé", () => {
  const invalidCorpus = structuredClone(corpus);
  invalidCorpus.episodes[0].segments[0].excerpt = "mot ".repeat(26).trim();

  assert.match(validateCorpus(invalidCorpus).join("\n"), /dépasse 25 mots/);
});

test("un procédé rhétorique doit rester lié à un passage source", () => {
  const invalidCorpus = structuredClone(corpus);
  invalidCorpus.arguments[1].rhetoricalMoves[0].segmentIds = ["segment-inconnu"];

  assert.match(validateCorpus(invalidCorpus).join("\n"), /segment inconnu/);
});

test("les sous-titres automatiques publient une note de fiabilité", () => {
  const invalidCorpus = structuredClone(corpus);
  delete invalidCorpus.episodes[1].transcript.reliabilityNote;

  assert.match(validateCorpus(invalidCorpus).join("\n"), /note de fiabilité absente/);
});
