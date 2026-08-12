import { readFile } from "node:fs/promises";
import { validateFormulationCatalog } from "./lib/formulation-validation.mjs";

const catalog = JSON.parse(await readFile(new URL("../content/formulation-profiles.json", import.meta.url), "utf8"));
const corpus = JSON.parse(await readFile(new URL("../content/corpus.json", import.meta.url), "utf8"));
const errors = validateFormulationCatalog(catalog, new Set(corpus.arguments.map((argument) => argument.id)));

if (errors.length) {
  console.error(`Profils de formulation invalides (${errors.length}) :`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Profils valides : ${catalog.axes.length} axes et ${catalog.profiles.length} arguments factorisés.`);
}
