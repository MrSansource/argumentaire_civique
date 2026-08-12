import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { buildReviewQueue, classifyReviewLane, REVIEW_LANES } from "../src/lib/review-queue.mjs";

const corpus = JSON.parse(await readFile(new URL("../content/corpus.json", import.meta.url), "utf8"));

test("classe les vérifications selon la situation la plus prudente", () => {
  assert.equal(classifyReviewLane([]).id, "missing");
  assert.equal(classifyReviewLane([{ status: "supported" }]).id, "supported");
  assert.equal(classifyReviewLane([{ status: "qualified" }, { status: "supported" }]).id, "qualified");
  assert.equal(classifyReviewLane([{ status: "contradicted" }, { status: "supported" }]).id, "contradicted");
});

test("construit une file complète et traçable depuis le corpus", () => {
  const queue = buildReviewQueue(corpus);

  assert.equal(queue.totalClaims, corpus.claims.length);
  assert.equal(queue.argumentCoverage.length, corpus.arguments.length);
  assert.equal(queue.items.every((item) => item.sourceId && item.arguments.length > 0), true);
  assert.equal(queue.items.every((item) => item.segmentIds.length > 0), true);
  assert.equal(Object.values(queue.countsByLane).reduce((total, count) => total + count, 0), corpus.claims.length);
});

test("rend visibles les compteurs de couverture sans les appeler des verdicts", () => {
  const queue = buildReviewQueue(corpus);
  const verifiedClaimIds = new Set(corpus.verifications.map((verification) => verification.claimId));

  assert.equal(queue.countsByLane.missing, corpus.claims.length - verifiedClaimIds.size);
  assert.equal(queue.verifiedClaims, verifiedClaimIds.size);
  assert.equal(queue.draftClaims, corpus.claims.filter((claim) => claim.status === "draft").length);
  assert.equal(queue.countsByLane.missing, 0);
  assert.ok(queue.countsByLane.inconclusive > 0);
  assert.ok(queue.countsByLane.qualified > 0);
  assert.ok(queue.countsByLane.supported > 0);
});

test("classe les lacunes thématiques sans score composite", () => {
  const queue = buildReviewQueue(corpus);
  const ai = queue.themeCoverage.find((theme) => theme.themeId === "ia-travail");
  const ecology = queue.themeCoverage.find((theme) => theme.themeId === "ecologie");
  const economy = queue.themeCoverage.find((theme) => theme.themeId === "economie");

  assert.equal(queue.themeCoverage.length, corpus.themes.length);
  assert.deepEqual(
    [ai?.argumentCount, ai?.sourceCount, ai?.statusId],
    [0, 0, "empty"],
  );
  assert.equal(ecology?.statusId, "single-source");
  assert.equal(economy?.statusId, "multi-source");
  assert.equal(Object.hasOwn(economy ?? {}, "score"), false);
});

test("compte des objets distincts pour chaque thème", () => {
  const queue = buildReviewQueue(corpus);
  const workDemocracy = queue.themeCoverage.find(
    (theme) => theme.themeId === "democratie-travail",
  );

  assert.deepEqual(
    {
      arguments: workDemocracy?.argumentCount,
      claims: workDemocracy?.claimCount,
      sources: workDemocracy?.sourceCount,
      references: workDemocracy?.referenceCount,
    },
    { arguments: 1, claims: 3, sources: 1, references: 5 },
  );
});

test("mesure la couverture complète de l'argument sur la démocratie au travail", () => {
  const queue = buildReviewQueue(corpus);
  const coverage = queue.argumentCoverage.find(
    (argument) => argument.argumentId === "argument-democratie-lieu-travail",
  );

  assert.equal(coverage?.claimCount, 3);
  assert.equal(coverage?.verifiedCount, 3);
  assert.equal(coverage?.coveragePercent, 100);
});

test("mesure la couverture complète de l'argument sur l'action malgré l'inconfort", () => {
  const queue = buildReviewQueue(corpus);
  const coverage = queue.argumentCoverage.find(
    (argument) => argument.argumentId === "argument-agir-sans-attendre-etat-ideal",
  );

  assert.equal(coverage?.claimCount, 4);
  assert.equal(coverage?.verifiedCount, 4);
  assert.equal(coverage?.coveragePercent, 100);
});

test("mesure la couverture complète de l'argument sur les finalités écologiques", () => {
  const queue = buildReviewQueue(corpus);
  const coverage = queue.argumentCoverage.find(
    (argument) => argument.argumentId === "argument-definir-finalites-avant-optimiser",
  );

  assert.equal(coverage?.claimCount, 4);
  assert.equal(coverage?.verifiedCount, 4);
  assert.equal(coverage?.coveragePercent, 100);
});

test("mesure la couverture complète de l'argument sur le diagnostic matériel", () => {
  const queue = buildReviewQueue(corpus);
  const coverage = queue.argumentCoverage.find(
    (argument) => argument.argumentId === "argument-tester-materiel-avant-psychologiser",
  );

  assert.equal(coverage?.claimCount, 4);
  assert.equal(coverage?.verifiedCount, 4);
  assert.equal(coverage?.coveragePercent, 100);
});

test("mesure la couverture complète de l'argument sur les cartes électorales", () => {
  const queue = buildReviewQueue(corpus);
  const coverage = queue.argumentCoverage.find(
    (argument) => argument.argumentId === "argument-lire-cartes-sans-fabriquer-electeur",
  );

  assert.equal(coverage?.claimCount, 6);
  assert.equal(coverage?.verifiedCount, 6);
  assert.equal(coverage?.coveragePercent, 100);
});

test("mesure la couverture complète de l'argument sur les préférences conversationnelles", () => {
  const queue = buildReviewQueue(corpus);
  const coverage = queue.argumentCoverage.find(
    (argument) => argument.argumentId === "argument-demander-preferences-sans-inferer-type",
  );

  assert.equal(coverage?.claimCount, 4);
  assert.equal(coverage?.verifiedCount, 4);
  assert.equal(coverage?.coveragePercent, 100);
});

test("mesure la couverture complète de l'argument sur l'observation des gestes", () => {
  const queue = buildReviewQueue(corpus);
  const coverage = queue.argumentCoverage.find(
    (argument) => argument.argumentId === "argument-lire-gestes-comme-adaptations",
  );

  assert.equal(coverage?.claimCount, 4);
  assert.equal(coverage?.verifiedCount, 4);
  assert.equal(coverage?.coveragePercent, 100);
});

test("mesure la couverture complète de l'argument sur les prises sans pureté", () => {
  const queue = buildReviewQueue(corpus);
  const coverage = queue.argumentCoverage.find(
    (argument) => argument.argumentId === "argument-chercher-prises-sans-purete",
  );

  assert.equal(coverage?.claimCount, 5);
  assert.equal(coverage?.verifiedCount, 5);
  assert.equal(coverage?.coveragePercent, 100);
});

test("mesure la couverture complète de l'argument sur les rapports sociaux", () => {
  const queue = buildReviewQueue(corpus);
  const coverage = queue.argumentCoverage.find(
    (argument) => argument.argumentId === "argument-nommer-rapports-sociaux",
  );

  assert.equal(coverage?.claimCount, 4);
  assert.equal(coverage?.verifiedCount, 4);
  assert.equal(coverage?.coveragePercent, 100);
});

test("ordonne la file de la situation la plus prudente à la plus étayée", () => {
  const queue = buildReviewQueue(corpus);
  const rankByLane = new Map(REVIEW_LANES.map((lane, index) => [lane.id, index]));
  const ranks = queue.items.map((item) => rankByLane.get(item.laneId));

  assert.deepEqual(ranks, [...ranks].sort((left, right) => left - right));
});
