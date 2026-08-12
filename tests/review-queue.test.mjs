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

test("rend visibles les lacunes actuelles sans les appeler des verdicts", () => {
  const queue = buildReviewQueue(corpus);

  assert.equal(queue.countsByLane.missing, 17);
  assert.equal(queue.countsByLane.inconclusive, 6);
  assert.equal(queue.countsByLane.qualified, 19);
  assert.equal(queue.countsByLane.supported, 8);
  assert.equal(queue.verifiedClaims, 33);
  assert.equal(queue.draftClaims, 50);
});

test("ordonne la file de la situation la plus prudente à la plus étayée", () => {
  const queue = buildReviewQueue(corpus);
  const rankByLane = new Map(REVIEW_LANES.map((lane, index) => [lane.id, index]));
  const ranks = queue.items.map((item) => rankByLane.get(item.laneId));

  assert.deepEqual(ranks, [...ranks].sort((left, right) => left - right));
});
