import { readFile } from "node:fs/promises";
import { validateCorpus } from "./lib/corpus-validation.mjs";

const corpusUrl = new URL("../content/corpus.json", import.meta.url);
const corpus = JSON.parse(await readFile(corpusUrl, "utf8"));
const errors = validateCorpus(corpus);

if (errors.length) {
  console.error(`Corpus invalide (${errors.length} erreur${errors.length > 1 ? "s" : ""}) :`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(
    `Corpus valide : ${corpus.sources.length} sources, ${corpus.episodes.length} épisode${corpus.episodes.length > 1 ? "s" : ""}, ` +
      `${corpus.claims.length} affirmations et ${corpus.arguments.length} argument${corpus.arguments.length > 1 ? "s" : ""}.`,
  );
}
