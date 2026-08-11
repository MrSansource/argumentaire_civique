"use client";

import { useMemo, useState } from "react";
import {
  estimateIndependentIntersection,
  frechetBounds,
  roundToUnit,
  signedDifferencePercent,
} from "@/lib/population-estimation.mjs";
import {
  formatPercent,
  formatPopulation,
  getObservationCount,
  type PopulationDataset,
  type PopulationDimension,
} from "@/lib/population";

type Props = {
  ageDimension: PopulationDimension;
  dataset: PopulationDataset;
  dimensions: PopulationDimension[];
  sexDimension: PopulationDimension;
};

const dimensionStatusLabels = {
  active: "Disponible",
  planned: "À mapper",
  "research-only": "Recherche seule",
  restricted: "Restreinte",
} as const;

export function PopulationLab({ ageDimension, dataset, dimensions, sexDimension }: Props) {
  const [ageId, setAgeId] = useState("75-plus");
  const [sexId, setSexId] = useState("women");

  const analysis = useMemo(() => {
    const observed = getObservationCount(dataset, {
      [ageDimension.id]: ageId,
      [sexDimension.id]: sexId,
    });
    const ageMarginal = dataset.marginals[ageDimension.id][ageId];
    const sexMarginal = dataset.marginals[sexDimension.id][sexId];
    const shares = [ageMarginal / dataset.total, sexMarginal / dataset.total];
    const independentRaw = estimateIndependentIntersection(dataset.total, shares);
    const boundsRaw = frechetBounds(dataset.total, shares);
    return {
      observed,
      ageMarginal,
      sexMarginal,
      independent: roundToUnit(independentRaw, dataset.roundingUnit),
      bounds: {
        lower: roundToUnit(boundsRaw.lower, dataset.roundingUnit),
        upper: roundToUnit(boundsRaw.upper, dataset.roundingUnit),
      },
      difference: signedDifferencePercent(independentRaw, observed),
    };
  }, [ageDimension.id, ageId, dataset, sexDimension.id, sexId]);

  const ageLabel = ageDimension.categories.find((item) => item.id === ageId)?.label ?? ageId;
  const sexLabel = sexDimension.categories.find((item) => item.id === sexId)?.label ?? sexId;
  const maxCell = Math.max(...dataset.observations.map((item) => item.count));
  const roundedHalfUnit = dataset.roundingUnit / 2;

  return (
    <>
      <section className="population-workbench" aria-labelledby="population-workbench-title">
        <div className="population-controls">
          <div>
            <p className="section-kicker">Banc d&apos;essai</p>
            <h2 id="population-workbench-title">Observer avant d&apos;estimer.</h2>
            <p>
              La table Insee publie directement ce croisement. On peut donc mesurer ce que produit
              l&apos;hypothèse simplificatrice d&apos;indépendance entre l&apos;âge et le sexe statistique.
            </p>
          </div>
          <div className="population-selectors">
            <label>
              Groupe d&apos;âge
              <select value={ageId} onChange={(event) => setAgeId(event.target.value)}>
                {ageDimension.categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
            </label>
            <label>
              Sexe statistique
              <select value={sexId} onChange={(event) => setSexId(event.target.value)}>
                {sexDimension.categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="population-results" aria-live="polite">
          <article className="population-result result-observed">
            <span>Observation publiée</span>
            <strong>{formatPopulation(analysis.observed)}</strong>
            <p>{sexLabel} · {ageLabel}</p>
            <small>
              Arrondi au millier : intervalle de lecture approximatif de {formatPopulation(analysis.observed - roundedHalfUnit)} à {formatPopulation(analysis.observed + roundedHalfUnit)}.
            </small>
          </article>
          <article className="population-result">
            <span>Produit des marges</span>
            <strong>{formatPopulation(analysis.independent)}</strong>
            <p>Hypothèse d&apos;indépendance</p>
            <small className={analysis.difference < 0 ? "difference-negative" : "difference-positive"}>
              {analysis.difference < 0 ? "Sous-estime" : "Surestime"} la cellule observée de {formatPercent(Math.abs(analysis.difference))} %.
            </small>
          </article>
          <article className="population-result">
            <span>Bornes sans indépendance</span>
            <strong>{formatPopulation(analysis.bounds.lower)}–{formatPopulation(analysis.bounds.upper)}</strong>
            <p>Bornes logiques de Fréchet</p>
            <small>
              Les seules marges autorisent une plage très large : elles ne remplacent pas une donnée croisée.
            </small>
          </article>
        </div>

        <div className="population-formula">
          <span>Calcul transparent</span>
          <code>
            {formatPopulation(dataset.total)} × {formatPercent((analysis.ageMarginal / dataset.total) * 100)} % × {formatPercent((analysis.sexMarginal / dataset.total) * 100)} % = {formatPopulation(analysis.independent)}
          </code>
          <p>
            Cette multiplication est un scénario, pas une observation. L&apos;écart avec la cellule Insee
            montre pourquoi chaque hypothèse de factorisation doit rester visible.
          </p>
        </div>
      </section>

      <section className="population-matrix-section" aria-labelledby="population-matrix-title">
        <div className="population-section-heading">
          <div>
            <p className="section-kicker">28 cellules observées</p>
            <h2 id="population-matrix-title">Matrice âge × sexe</h2>
          </div>
          <p>Clique sur une cellule pour la comparer à l&apos;estimation factorisée.</p>
        </div>
        <div className="population-table-scroll">
          <table className="population-matrix">
            <thead>
              <tr>
                <th scope="col">Groupe d&apos;âge</th>
                {sexDimension.categories.map((category) => <th scope="col" key={category.id}>{category.label}</th>)}
                <th scope="col">Ensemble</th>
              </tr>
            </thead>
            <tbody>
              {ageDimension.categories.map((ageCategory) => (
                <tr key={ageCategory.id}>
                  <th scope="row">{ageCategory.label}</th>
                  {sexDimension.categories.map((sexCategory) => {
                    const count = getObservationCount(dataset, {
                      [ageDimension.id]: ageCategory.id,
                      [sexDimension.id]: sexCategory.id,
                    });
                    const selected = ageCategory.id === ageId && sexCategory.id === sexId;
                    const alpha = 0.05 + (count / maxCell) * 0.18;
                    return (
                      <td key={sexCategory.id} className={selected ? "matrix-selected" : ""}>
                        <button
                          type="button"
                          onClick={() => {
                            setAgeId(ageCategory.id);
                            setSexId(sexCategory.id);
                          }}
                          style={{ backgroundColor: `rgba(23, 63, 50, ${alpha})` }}
                          aria-label={`${ageCategory.label}, ${sexCategory.label} : ${formatPopulation(count)} personnes`}
                        >
                          <strong>{formatPopulation(count)}</strong>
                          <small>{formatPercent((count / dataset.total) * 100)} %</small>
                        </button>
                      </td>
                    );
                  })}
                  <td className="matrix-total">{formatPopulation(dataset.marginals[ageDimension.id][ageCategory.id])}</td>
                </tr>
              ))}
              <tr className="matrix-total-row">
                <th scope="row">Ensemble</th>
                {sexDimension.categories.map((category) => (
                  <td key={category.id}>{formatPopulation(dataset.marginals[sexDimension.id][category.id])}</td>
                ))}
                <td>{formatPopulation(dataset.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="population-source-note">
          <p>{dataset.methodologyNote}</p>
          <a href={dataset.url} target="_blank" rel="noreferrer">
            {dataset.publisher} · {dataset.title} ↗
          </a>
        </div>
      </section>

      <section
        className="dimension-catalog"
        id="dimensions-population"
        aria-labelledby="dimension-catalog-title"
      >
        <div className="population-section-heading">
          <div>
            <p className="section-kicker">Nomenclatures versionnées</p>
            <h2 id="dimension-catalog-title">Ce qui est utilisable — et ce qui ne l&apos;est pas.</h2>
          </div>
          <p>Une dimension sans source, définition stable ou règle d&apos;usage ne peut pas alimenter une estimation.</p>
        </div>
        <div className="dimension-catalog-grid">
          {dimensions.map((dimension) => (
            <article key={dimension.id}>
              <div>
                <span className={`dimension-status dimension-${dimension.status}`}>
                  {dimensionStatusLabels[dimension.status]}
                </span>
                <small>v{dimension.version}</small>
              </div>
              <h3>{dimension.label}</h3>
              <p>{dimension.definition}</p>
              <dl>
                <div><dt>Preuve</dt><dd>{dimension.evidenceStatus.replaceAll("-", " ")}</dd></div>
                <div><dt>Usage</dt><dd>{dimension.usage.replaceAll("-", " ")}</dd></div>
                <div><dt>Catégories</dt><dd>{dimension.categories.length || "À définir"}</dd></div>
              </dl>
              <details>
                <summary>Voir les limites</summary>
                <ul>{dimension.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
              </details>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
