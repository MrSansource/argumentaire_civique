import assert from "node:assert/strict";
import test from "node:test";
import { chunkSegments, cleanCaptionText, parseTranscript, timestampToMs } from "../scripts/lib/transcript.mjs";

test("convertit les horodatages VTT et SRT", () => {
  assert.equal(timestampToMs("00:01:02.345"), 62_345);
  assert.equal(timestampToMs("01:02,345"), 62_345);
});

test("nettoie balises et entités des sous-titres", () => {
  assert.equal(cleanCaptionText("<c>Une&nbsp; phrase</c>  test"), "Une phrase test");
});

test("importe des segments VTT en conservant les timestamps", () => {
  const segments = parseTranscript(`WEBVTT

00:00:01.000 --> 00:00:03.000
Première phrase.

00:00:03.500 --> 00:00:05.000 align:start
Deuxième phrase.
`);

  assert.deepEqual(segments, [
    { id: "seg-00001", startMs: 1_000, endMs: 3_000, text: "Première phrase." },
    { id: "seg-00002", startMs: 3_500, endMs: 5_000, text: "Deuxième phrase." },
  ]);
});

test("regroupe les segments en lots sans perdre leurs identifiants", () => {
  const segments = [
    { id: "a", text: "un ".repeat(40).trim() },
    { id: "b", text: "deux ".repeat(40).trim() },
    { id: "c", text: "trois ".repeat(40).trim() },
  ];
  const chunks = chunkSegments(segments, 80);

  assert.equal(chunks.length, 2);
  assert.deepEqual(chunks.flat().map((segment) => segment.id), ["a", "b", "c"]);
});
