"use client";

import { useMemo, useState } from "react";
import type {
  CorpusArgument,
  CorpusClaim,
  CorpusEpisode,
  CorpusReference,
  CorpusSource,
  CorpusTheme,
  CorpusVerification,
} from "@/lib/corpus";
import { formatTimestamp, youtubeUrlAt } from "@/lib/corpus";

type Props = {
  argumentsList: CorpusArgument[];
  claims: CorpusClaim[];
  episodes: CorpusEpisode[];
  references: CorpusReference[];
  sources: CorpusSource[];
  themes: CorpusTheme[];
  verifications: CorpusVerification[];
};

const statusLabels = {
  identified: "Identifiée",
  candidate: "À confirmer",
  unresolved: "Non résolue",
  draft: "Brouillon",
  reviewed: "Relu",
  validated: "Validé",
  rejected: "Rejeté",
  open: "À instruire",
  supported: "Étayé",
  qualified: "Conclusion nuancée",
  contradicted: "Contredit",
  inconclusive: "Non concluant",
} as const;

const verificationModeLabels: Record<string, string> = {
  empirical: "Empirique",
  conceptual: "Conceptuelle",
  discourse: "Analyse du discours",
};

export function CorpusExplorer({
  argumentsList,
  claims,
  episodes,
  references,
  sources,
  themes,
  verifications,
}: Props) {
  const [query, setQuery] = useState("");
  const [themeId, setThemeId] = useState("all");

  const claimById = useMemo(() => new Map(claims.map((claim) => [claim.id, claim])), [claims]);
  const episodeById = useMemo(
    () => new Map(episodes.map((episode) => [episode.id, episode])),
    [episodes],
  );
  const sourceById = useMemo(() => new Map(sources.map((source) => [source.id, source])), [sources]);
  const referenceById = useMemo(
    () => new Map(references.map((reference) => [reference.id, reference])),
    [references],
  );

  const filteredArguments = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    return argumentsList.filter((argument) => {
      const matchesTheme = themeId === "all" || argument.themeIds.includes(themeId);
      const relatedVerifications = verifications.filter((verification) =>
        argument.premiseClaimIds.includes(verification.claimId),
      );
      const searchable = [
        argument.title,
        argument.thesisFr,
        ...argument.objections.map((item) => item.title),
        ...(argument.rhetoricalMoves ?? []).map((item) => item.device),
        ...argument.adaptationConstraints,
        ...relatedVerifications.flatMap((item) => [item.questionFr, item.findingFr, ...item.caveats]),
      ]
        .join(" ")
        .toLocaleLowerCase("fr");
      return matchesTheme && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [argumentsList, query, themeId, verifications]);

  return (
    <div className="explorer-layout">
      <aside className="explorer-sidebar">
        <div>
          <label htmlFor="corpus-search">Rechercher</label>
          <input
            id="corpus-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex. démocratie, travail…"
          />
        </div>
        <fieldset>
          <legend>Thèmes</legend>
          <button
            type="button"
            className={themeId === "all" ? "filter-active" : ""}
            onClick={() => setThemeId("all")}
          >
            Tous <span>{argumentsList.length}</span>
          </button>
          {themes.map((theme) => (
            <button
              type="button"
              key={theme.id}
              className={themeId === theme.id ? "filter-active" : ""}
              onClick={() => setThemeId(theme.id)}
            >
              {theme.label}
              <span>{argumentsList.filter((argument) => argument.themeIds.includes(theme.id)).length}</span>
            </button>
          ))}
        </fieldset>
        <div className="corpus-policy">
          <strong>Statut éditorial</strong>
          <p>Les contenus affichés sont des brouillons analytiques, pas des vérités validées.</p>
        </div>
      </aside>

      <div className="explorer-results">
        <div className="results-heading">
          <p>{filteredArguments.length} argument{filteredArguments.length > 1 ? "s" : ""}</p>
          <span>Corpus pilote · v1</span>
        </div>

        {filteredArguments.length === 0 ? (
          <div className="empty-state">
            <h2>Aucun résultat</h2>
            <p>Essaie un autre thème ou une recherche plus générale.</p>
          </div>
        ) : (
          filteredArguments.map((argument) => {
            const argumentClaims = argument.premiseClaimIds
              .map((claimId) => claimById.get(claimId))
              .filter((claim): claim is CorpusClaim => Boolean(claim));
            const evidenceWithDuplicates = argumentClaims.flatMap((claim) => {
              const episode = episodeById.get(claim.episodeId);
              if (!episode) return [];
              const source = sourceById.get(episode.sourceId);
              return claim.segmentIds.flatMap((segmentId) => {
                const segment = episode.segments.find((item) => item.id === segmentId);
                return segment ? [{ claim, episode, source, segment }] : [];
              });
            });
            const evidence = [
              ...new Map(
                evidenceWithDuplicates.map((item) => [item.segment.id, item]),
              ).values(),
            ];
            const argumentVerifications = verifications.filter((verification) =>
              argument.premiseClaimIds.includes(verification.claimId),
            );

            return (
              <article key={argument.id} className="argument-card">
                <div className="argument-meta">
                  <span className={`status-pill status-${argument.status}`}>
                    {statusLabels[argument.status]}
                  </span>
                  <span>{argument.reasoningPattern.replaceAll("-", " ")}</span>
                </div>
                <h2>{argument.title}</h2>
                <p className="argument-thesis">{argument.thesisFr}</p>

                <div className="argument-columns">
                  <section>
                    <h3>Chaîne de raisonnement</h3>
                    <ol>
                      {argumentClaims.map((claim) => (
                        <li key={claim.id}>
                          <p>{claim.statementFr}</p>
                          <small>{claim.epistemicNote}</small>
                        </li>
                      ))}
                    </ol>
                  </section>
                  <section>
                    <h3>Objections à instruire</h3>
                    <ul>
                      {argument.objections.map((objection) => (
                        <li key={objection.title}>
                          <strong>{objection.title}</strong>
                          <p>{objection.summaryFr}</p>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <section className="adaptation-guardrails" aria-labelledby={`guardrails-${argument.id}`}>
                  <div>
                    <span>Usage responsable</span>
                    <h3 id={`guardrails-${argument.id}`}>Garde-fous d’adaptation</h3>
                  </div>
                  <ul>
                    {argument.adaptationConstraints.map((constraint) => (
                      <li key={constraint}>{constraint}</li>
                    ))}
                  </ul>
                </section>

                {argument.rhetoricalMoves?.length ? (
                  <details className="rhetoric-panel">
                    <summary>Analyser les procédés rhétoriques</summary>
                    <div className="rhetoric-grid">
                      {argument.rhetoricalMoves.map((move) => (
                        <article key={move.device}>
                          <h3>{move.device}</h3>
                          <p><strong>Effet</strong>{move.effectFr}</p>
                          <p><strong>Risque</strong>{move.riskFr}</p>
                        </article>
                      ))}
                    </div>
                  </details>
                ) : null}

                {argumentVerifications.length ? (
                  <details className="verification-panel">
                    <summary>Consulter les {argumentVerifications.length} vérifications externes</summary>
                    <div className="verification-list">
                      {argumentVerifications.map((verification) => (
                        <article key={verification.id}>
                          <div>
                            <span className={`verification-status verification-${verification.status}`}>
                              {statusLabels[verification.status]}
                            </span>
                            <small>{verificationModeLabels[verification.mode] ?? verification.mode}</small>
                          </div>
                          <h3>{verification.questionFr}</h3>
                          <p>{verification.findingFr}</p>
                          <ul>
                            {verification.caveats.map((caveat) => <li key={caveat}>{caveat}</li>)}
                          </ul>
                          <div className="verification-sources">
                            {verification.referenceIds.map((referenceId) => {
                              const reference = referenceById.get(referenceId);
                              return reference ? (
                                <a key={reference.id} href={reference.url} target="_blank" rel="noreferrer">
                                  {reference.publisher} · {reference.title} ↗
                                </a>
                              ) : null;
                            })}
                          </div>
                        </article>
                      ))}
                    </div>
                  </details>
                ) : null}

                <details className="evidence-panel">
                  <summary>Voir les {evidence.length} passages sources</summary>
                  <div className="evidence-list">
                    {evidence.map(({ claim, episode, source, segment }) => (
                      <a
                        key={`${claim.id}-${segment.id}`}
                        href={youtubeUrlAt(episode.url, segment.startMs)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>{formatTimestamp(segment.startMs)}</span>
                        <div>
                          <strong>{source?.name ?? "Source inconnue"}</strong>
                          <p>{segment.paraphraseFr}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </details>
              </article>
            );
          })
        )}

        <section className="source-registry">
          <div>
            <p className="section-kicker">Registre de départ</p>
            <h2>Sources à documenter</h2>
          </div>
          <div className="source-registry-list">
            {sources.map((source) => (
              <article key={source.id}>
                <div>
                  <h3>{source.name}</h3>
                  <span className={`source-status source-${source.status}`}>
                    {statusLabels[source.status]}
                  </span>
                </div>
                <p>{source.editorialNote}</p>
                {source.url ? (
                  <a href={source.url} target="_blank" rel="noreferrer">
                    Ouvrir la source ↗
                  </a>
                ) : (
                  <small>URL à identifier</small>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
