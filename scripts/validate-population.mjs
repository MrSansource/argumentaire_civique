import { readFile } from "node:fs/promises";
import { validatePopulationCatalog } from "./lib/population-validation.mjs";

const catalogUrl = new URL("../content/population.json", import.meta.url);
const catalog = JSON.parse(await readFile(catalogUrl, "utf8"));
const errors = validatePopulationCatalog(catalog);

if (errors.length) {
  console.error(`Catalogue invalide (${errors.length}) :`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  const observations = catalog.datasets.reduce((sum, dataset) => sum + dataset.observations.length, 0);
  console.log(
    `Catalogue valide : ${catalog.dimensions.length} dimensions, ${catalog.datasets.length} jeu de données et ${observations} cellules observées.`,
  );
}
