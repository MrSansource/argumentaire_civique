"use client";

import { useMemo, useState } from "react";
import type { CorpusArgument, CorpusTheme } from "@/lib/corpus";
import type { FormulationAxis } from "@/lib/formulations";
import type { FormulationAxisId, FormulationProfile, FormulationVector } from "@/lib/formulation-ranking.mjs";
import { rankFormulationProfiles } from "@/lib/formulation-ranking.mjs";

type Props = {
  argumentsList: CorpusArgument[];
  axes: FormulationAxis[];
  profiles: FormulationProfile[];
  themes: CorpusTheme[];
};

const initialVector: FormulationVector = {
  evidenceValues: 50,
  individualSystemic: 50,
  deliberationAction: 50,
  accessibleTechnical: 50,
};

function positionLabel(axis: FormulationAxis, value: number) {
  if (value <= 40) return axis.lowLabel;
  if (value >= 60) return axis.highLabel;
  return "Équilibre des deux approches";
}

export function ArgumentComposer({ argumentsList, axes, profiles, themes }: Props) {
  const [target, setTarget] = useState<FormulationVector>(initialVector);
  const [themeId, setThemeId] = useState("all");
  const argumentById = useMemo(
    () => new Map(argumentsList.map((argument) => [argument.id, argument])),
    [argumentsList],
  );
  const axisById = useMemo(() => new Map(axes.map((axis) => [axis.id, axis])), [axes]);
  const themeById = useMemo(() => new Map(themes.map((theme) => [theme.id, theme])), [themes]);

  const results = useMemo(() => {
    const eligibleProfiles = profiles.filter((profile) => {
      const argument = argumentById.get(profile.argumentId);
      return argument && (themeId === "all" || argument.themeIds.includes(themeId));
    });
    if (!eligibleProfiles.length) return [];
    return rankFormulationProfiles(eligibleProfiles, target, Math.min(3, eligibleProfiles.length));
  }, [argumentById, profiles, target, themeId]);

  const updateAxis = (axisId: FormulationAxisId, value: number) => {
    setTarget((current) => ({ ...current, [axisId]: value }));
  };

  return (
    <div className="composer-layout">
      <aside className="composer-controls">
        <div className="composer-policy">
          <span>Réglages locaux</span>
          <p>Aucun profil n’est déduit, enregistré ou envoyé. Vous choisissez seulement la forme de la recherche actuelle.</p>
        </div>

        <label className="composer-theme">
          Thème facultatif
          <select value={themeId} onChange={(event) => setThemeId(event.target.value)}>
            <option value="all">Tous les thèmes</option>
            {themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.label}</option>)}
          </select>
        </label>

        <div className="composer-axes">
          {axes.map((axis) => (
            <label key={axis.id}>
              <span><strong>{axis.label}</strong><output>{positionLabel(axis, target[axis.id])}</output></span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={target[axis.id]}
                onChange={(event) => updateAxis(axis.id, Number(event.target.value))}
              />
              <span className="axis-poles"><small>{axis.lowLabel}</small><small>{axis.highLabel}</small></span>
              <em>{axis.description}</em>
            </label>
          ))}
        </div>

        <button type="button" className="composer-reset" onClick={() => setTarget(initialVector)}>
          Revenir à l’équilibre
        </button>
      </aside>

      <section className="composer-results" aria-live="polite">
        <div className="composer-results-heading">
          <div><span>{results.length}</span> pistes proches</div>
          <p>Le pourcentage mesure une distance entre annotations éditoriales, pas une probabilité d’efficacité.</p>
        </div>

        {results.length ? results.map((result, index) => {
          const argument = argumentById.get(result.argumentId);
          if (!argument) return null;
          return (
            <article className="composer-result" key={result.argumentId}>
              <div className="composer-rank"><span>0{index + 1}</span><strong>{result.similarity}%</strong><small>proximité éditoriale</small></div>
              <div className="composer-result-body">
                <div className="composer-result-meta">
                  {argument.themeIds.map((id) => <span key={id}>{themeById.get(id)?.label ?? id}</span>)}
                </div>
                <h2>{argument.title}</h2>
                <p>{argument.thesisFr}</p>
                <div className="composer-why">
                  <h3>Pourquoi cette piste remonte</h3>
                  <p>{result.editorialNote}</p>
                  <ul>
                    {result.closestAxes.map((axisId) => {
                      const axis = axisById.get(axisId);
                      return axis ? <li key={axisId}>{axis.label} · écart de {result.axisDistances[axisId]} points</li> : null;
                    })}
                  </ul>
                </div>
                <div className="composer-guardrails">
                  <strong>À préserver dans la formulation</strong>
                  <ul>{argument.adaptationConstraints.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <a href={`/explorer#${argument.id}`}>Ouvrir l’argument complet →</a>
              </div>
            </article>
          );
        }) : (
          <div className="empty-state"><h2>Aucune piste pour ce thème</h2><p>Choisissez un autre thème ou revenez à l’ensemble du corpus.</p></div>
        )}
      </section>
    </div>
  );
}
