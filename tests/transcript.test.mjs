import assert from "node:assert/strict";
import test from "node:test";
import {
  assertTranscriptReadyForAnalysis,
  chunkSegments,
  cleanCaptionText,
  normalizeTranscriptProvenance,
  parseTranscript,
  timestampToMs,
} from "../scripts/lib/transcript.mjs";

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

test("fusionne les sous-titres roulants de YouTube sans répéter le texte", () => {
  const segments = parseTranscript(`WEBVTT

00:00:00.000 --> 00:00:02.000
Le point parle des prolétaires,

00:00:02.000 --> 00:00:04.000
Le point parle des prolétaires, et des couches moyennes

00:00:04.000 --> 00:00:04.010
et des couches moyennes

00:00:04.010 --> 00:00:06.000
et des couches moyennes intermédiaires.
`);

  assert.deepEqual(segments, [
    {
      id: "seg-00001",
      startMs: 0,
      endMs: 6_000,
      text: "Le point parle des prolétaires, et des couches moyennes intermédiaires.",
    },
  ]);
});

test("borne la durée d'un segment roulant", () => {
  const segments = parseTranscript(`WEBVTT

00:00:00.000 --> 00:00:20.000
Une première idée assez longue

00:00:20.000 --> 00:00:40.000
Une première idée assez longue puis une idée nouvelle
`);

  assert.deepEqual(segments, [
    { id: "seg-00001", startMs: 0, endMs: 20_000, text: "Une première idée assez longue" },
    { id: "seg-00002", startMs: 20_000, endMs: 40_000, text: "puis une idée nouvelle" },
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

test("normalise une provenance attribuée avant analyse", () => {
  const provenance = normalizeTranscriptProvenance({
    publisherName: "Chaîne éditrice",
    publisherUrl: "https://www.youtube.com/@chaine",
    speakers: ["Intervenante", "Intervenante", "Animateur"],
    attributionStatus: "mixed",
    sourceRole: "panelist",
    attributionNote: "Les intervenants sont nommés dans l'introduction et vérifiés dans l'audio.",
  });

  assert.deepEqual(provenance.speakers, ["Intervenante", "Animateur"]);
  assert.equal(provenance.sourceRole, "panelist");
});

test("refuse d'analyser une vidéo qui cite seulement la source", () => {
  assert.throws(
    () => assertTranscriptReadyForAnalysis({
      provenance: {
        publisherName: "La France insoumise",
        publisherUrl: "https://www.youtube.com/channel/UCKHKSD-yanY2ZwwU_4Tgf0w",
        speakers: ["Membres du pôle militer sans tracts"],
        attributionStatus: "mixed",
        sourceRole: "subject-only",
        attributionNote: "Franck Lepage est seulement cité ; il n'intervient pas dans l'enregistrement.",
      },
    }),
    /n'intervient pas dans la vidéo/,
  );
});

test("refuse un ancien transcript sans provenance", () => {
  assert.throws(() => assertTranscriptReadyForAnalysis({}), /Provenance absente/);
});
