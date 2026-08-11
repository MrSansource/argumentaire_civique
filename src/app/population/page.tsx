import type { Metadata } from "next";
import Link from "next/link";
import { PopulationLab } from "@/components/population-lab";
import { formatPopulation, getDimension, population } from "@/lib/population";

export const metadata: Metadata = {
  title: "Laboratoire population · Argumentaire civique",
  description: "Explorer une matrice démographique sourcée et comparer observations, hypothèses d'indépendance et bornes d'incertitude.",
};

export default function PopulationPage() {
  const dataset = population.datasets[0];
  const ageDimension = getDimension("age-group-2026");
  const sexDimension = getDimension("statistical-sex-2026");

  return (
    <main className="population-page">
      <header className="site-header population-header">
        <Link className="brand" href="/" aria-label="Argumentaire civique — accueil">
          <span className="brand-mark">AC</span>
          <span>Argumentaire civique</span>
        </Link>
        <nav aria-label="Navigation du laboratoire">
          <Link href="/explorer">Corpus</Link>
          <a href="#matrice">Matrice</a>
          <a href="#dimensions-population">Dimensions</a>
        </nav>
        <Link className="github-link" href="/">← Retour au manifeste</Link>
      </header>

      <section className="population-hero">
        <div>
          <p className="section-kicker">Laboratoire quantitatif · France 2026</p>
          <h1>Croiser les catégories<br /><em>sans inventer les données.</em></h1>
          <p>
            Une première matrice officielle pour tester les calculs, rendre les hypothèses visibles
            et refuser les fausses précisions quand un croisement n&apos;est pas observé.
          </p>
        </div>
        <dl>
          <div><dt>{formatPopulation(dataset.total)}</dt><dd>personnes estimées</dd></div>
          <div><dt>{dataset.observations.length}</dt><dd>cellules publiées</dd></div>
          <div><dt>{population.dimensions.length}</dt><dd>dimensions cataloguées</dd></div>
          <div><dt>0</dt><dd>profil individuel</dd></div>
        </dl>
      </section>

      <div id="matrice">
        <PopulationLab
          ageDimension={ageDimension}
          dataset={dataset}
          dimensions={population.dimensions}
          sexDimension={sexDimension}
        />
      </div>
    </main>
  );
}
