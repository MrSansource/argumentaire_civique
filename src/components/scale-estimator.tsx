"use client";

import { useMemo, useState } from "react";
import { estimateArgumentSpace, parseDimensionSizes } from "@/lib/scale-estimator.mjs";

const defaultSizes = "2, 2, 2, 2, 2, 5, 5, 5, 10, 16";
const numberFormatter = new Intl.NumberFormat("fr-FR");

export function ScaleEstimator() {
  const [sizesInput, setSizesInput] = useState(defaultSizes);
  const [themeCount, setThemeCount] = useState(7);

  const result = useMemo(() => {
    try {
      return { estimate: estimateArgumentSpace(parseDimensionSizes(sizesInput), themeCount), error: null };
    } catch (error) {
      return {
        estimate: null,
        error: error instanceof Error ? error.message : "Valeurs invalides.",
      };
    }
  }, [sizesInput, themeCount]);

  return (
    <section className="scale-estimator" id="echelle">
      <div className="population-section-heading">
        <div>
          <p className="section-kicker">Ordre de grandeur</p>
          <h2>Compter avant de générer.</h2>
        </div>
        <p>
          Une grille correspond ici à une paire de nomenclatures distinctes, sans compter deux fois
          A × B et B × A. Les variantes thématiques dépendent ensuite du sens donné à un « couple ».
        </p>
      </div>

      <div className="scale-controls">
        <label>
          Tailles des nomenclatures
          <input
            value={sizesInput}
            onChange={(event) => setSizesInput(event.target.value)}
            aria-describedby="sizes-help"
          />
          <small id="sizes-help">Séparer les tailles par une virgule ou un espace.</small>
        </label>
        <label>
          Nombre de thèmes
          <input
            type="number"
            min="1"
            step="1"
            value={themeCount}
            onChange={(event) => setThemeCount(Number(event.target.value))}
          />
        </label>
      </div>

      {result.error ? (
        <p className="scale-error" role="alert">{result.error}</p>
      ) : result.estimate ? (
        <>
          <div className="scale-results">
            <article>
              <span>Grilles uniques</span>
              <strong>{numberFormatter.format(result.estimate.gridCount)}</strong>
              <p>n × (n − 1) ÷ 2, sans auto-croisement ni doublon d’ordre.</p>
            </article>
            <article>
              <span>Cellules à deux dimensions</span>
              <strong>{numberFormatter.format(result.estimate.cellCount)}</strong>
              <p>Somme des produits de tailles pour chaque paire de nomenclatures.</p>
            </article>
            <article className="scale-result-primary">
              <span>Arguments · couples uniques</span>
              <strong>{numberFormatter.format(result.estimate.unorderedArgumentSlots)}</strong>
              <p>{result.estimate.unorderedThemeVariants} variantes : thèmes seuls et paires distinctes non ordonnées.</p>
            </article>
            <article>
              <span>Lecture du calcul initial</span>
              <strong>{numberFormatter.format(result.estimate.statedArgumentSlots)}</strong>
              <p>{result.estimate.statedThemeVariants} variantes : thèmes seuls plus toutes les paires ordonnées, doublons inclus.</p>
            </article>
          </div>

          <div className="scale-strategy">
            <div>
              <span>Stratégie recommandée</span>
              <h3>Générer à la demande, capitaliser après revue.</h3>
            </div>
            <ol>
              <li>Composer un argument depuis des facteurs réutilisables plutôt que remplir chaque cellule.</li>
              <li>Générer seulement le croisement demandé et conserver sa clé canonique.</li>
              <li>Publier la version mise en cache après vérification des sources et des garde-fous.</li>
            </ol>
          </div>
        </>
      ) : null}
    </section>
  );
}
