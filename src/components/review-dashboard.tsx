"use client";

import { useMemo, useState } from "react";
import type { ReviewQueue } from "@/lib/review-queue.mjs";
import { REVIEW_LANES } from "@/lib/review-queue.mjs";

type Props = {
  queue: ReviewQueue;
  sources: Array<{ id: string; name: string }>;
};

const verificationLabels: Record<string, string> = {
  open: "À instruire",
  supported: "Étayé",
  qualified: "Conclusion nuancée",
  contradicted: "Contredit",
  inconclusive: "Non concluant",
};

export function ReviewDashboard({ queue, sources }: Props) {
  const [query, setQuery] = useState("");
  const [laneId, setLaneId] = useState("all");
  const [sourceId, setSourceId] = useState("all");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    return queue.items.filter((item) => {
      const matchesLane = laneId === "all" || item.laneId === laneId;
      const matchesSource = sourceId === "all" || item.sourceId === sourceId;
      const searchable = [
        item.statementFr,
        item.epistemicNote,
        item.sourceName,
        item.episodeTitle,
        ...item.arguments.map((argument) => argument.title),
        ...item.verifications.flatMap((verification) => [
          verification.questionFr,
          verification.findingFr,
          ...verification.caveats,
        ]),
      ].join(" ").toLocaleLowerCase("fr");
      return matchesLane && matchesSource && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [laneId, query, queue.items, sourceId]);

  return (
    <div className="review-layout">
      <aside className="review-sidebar">
        <label htmlFor="review-search">Rechercher dans la file</label>
        <input
          id="review-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Affirmation, source, argument…"
        />

        <label htmlFor="review-source">Source analysée</label>
        <select
          id="review-source"
          value={sourceId}
          onChange={(event) => setSourceId(event.target.value)}
        >
          <option value="all">Toutes les sources</option>
          {sources.map((source) => (
            <option key={source.id} value={source.id}>{source.name}</option>
          ))}
        </select>

        <fieldset>
          <legend>État de vérification</legend>
          <button
            type="button"
            className={laneId === "all" ? "review-filter-active" : ""}
            onClick={() => setLaneId("all")}
          >
            Toute la file <span>{queue.totalClaims}</span>
          </button>
          {REVIEW_LANES.map((lane) => (
            <button
              type="button"
              key={lane.id}
              className={laneId === lane.id ? "review-filter-active" : ""}
              onClick={() => setLaneId(lane.id)}
            >
              {lane.shortLabel} <span>{queue.countsByLane[lane.id]}</span>
            </button>
          ))}
        </fieldset>

        <div className="review-policy">
          <strong>Une priorité, pas un verdict</strong>
          <p>Cette file trie les lacunes documentaires. Elle ne valide ni ne rejette automatiquement un contenu.</p>
        </div>
      </aside>

      <div className="review-workspace">
        <section className="review-theme-coverage" aria-labelledby="theme-coverage-title">
          <div className="review-section-heading">
            <div>
              <p className="section-kicker">Largeur du corpus</p>
              <h2 id="theme-coverage-title">Où élargir le corpus.</h2>
            </div>
            <p>Ces compteurs montrent des volumes et la diversité des sources, jamais la qualité ni la représentativité d&apos;un thème.</p>
          </div>
          <div className="review-theme-grid">
            {queue.themeCoverage.map((theme) => (
              <article key={theme.themeId} className={`review-theme-card review-theme-${theme.statusId}`}>
                <div>
                  <span>{theme.statusLabel}</span>
                  <small>{theme.themeId}</small>
                </div>
                <h3>{theme.label}</h3>
                <p>{theme.description}</p>
                <dl>
                  <div><dt>{theme.argumentCount}</dt><dd>arguments</dd></div>
                  <div><dt>{theme.sourceCount}</dt><dd>sources</dd></div>
                  <div><dt>{theme.claimCount}</dt><dd>affirmations</dd></div>
                  <div><dt>{theme.referenceCount}</dt><dd>références</dd></div>
                </dl>
                <p className="review-theme-action">{theme.nextAction}</p>
                <a href="/contribuer">Proposer une piste →</a>
              </article>
            ))}
          </div>
        </section>

        <section className="review-coverage" aria-labelledby="coverage-title">
          <div className="review-section-heading">
            <div>
              <p className="section-kicker">Couverture par argument</p>
              <h2 id="coverage-title">Repérer les chaînes fragiles.</h2>
            </div>
            <p>Le pourcentage indique seulement la présence d&apos;une vérification externe pour les prémisses.</p>
          </div>
          <div className="review-coverage-grid">
            {queue.argumentCoverage.map((argument) => (
              <a key={argument.argumentId} href={`/explorer#${argument.argumentId}`}>
                <div>
                  <span className={`review-lane review-lane-${argument.laneId}`}>{argument.laneShortLabel}</span>
                  <strong>{argument.coveragePercent}%</strong>
                </div>
                <h3>{argument.title}</h3>
                <progress value={argument.verifiedCount} max={argument.claimCount}>
                  {argument.verifiedCount} sur {argument.claimCount}
                </progress>
                <p>{argument.verifiedCount}/{argument.claimCount} prémisses avec vérification externe</p>
              </a>
            ))}
          </div>
        </section>

        <section className="review-queue" aria-labelledby="queue-title">
          <div className="review-results-heading">
            <div>
              <p className="section-kicker">File de révision</p>
              <h2 id="queue-title">{filteredItems.length} affirmation{filteredItems.length > 1 ? "s" : ""} à examiner</h2>
            </div>
            <button
              type="button"
              onClick={() => { setQuery(""); setLaneId("all"); setSourceId("all"); }}
            >
              Réinitialiser les filtres
            </button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="review-empty">
              <h3>Aucune affirmation dans ce filtre.</h3>
              <p>Élargis la recherche ou réinitialise les critères.</p>
            </div>
          ) : filteredItems.map((item) => (
            <article key={item.claimId} className="review-card">
              <div className="review-card-meta">
                <span className={`review-lane review-lane-${item.laneId}`}>{item.laneShortLabel}</span>
                <span>{item.sourceName}</span>
                <span>{item.claimType.replaceAll("-", " ")}</span>
              </div>
              <h3>{item.statementFr}</h3>
              <p className="review-epistemic-note">{item.epistemicNote}</p>

              <dl className="review-card-stats">
                <div><dt>{item.segmentIds.length}</dt><dd>passage{item.segmentIds.length > 1 ? "s" : ""}</dd></div>
                <div><dt>{item.verifications.length}</dt><dd>vérification{item.verifications.length > 1 ? "s" : ""}</dd></div>
                <div><dt>{item.references.length}</dt><dd>référence{item.references.length > 1 ? "s" : ""}</dd></div>
                <div><dt>{item.arguments.length}</dt><dd>argument{item.arguments.length > 1 ? "s" : ""}</dd></div>
              </dl>

              <div className="review-next-action">
                <span>Prochaine décision éditoriale</span>
                <p>{item.nextAction}</p>
              </div>

              {item.verifications.length > 0 ? (
                <details className="review-verifications">
                  <summary>Lire les constats et limites</summary>
                  {item.verifications.map((verification) => (
                    <article key={verification.id}>
                      <div>
                        <strong>{verificationLabels[verification.status] ?? verification.status}</strong>
                        <span>{verification.mode.replaceAll("-", " ")}</span>
                      </div>
                      <h4>{verification.questionFr}</h4>
                      <p>{verification.findingFr}</p>
                      {verification.caveats.length > 0 ? (
                        <ul>{verification.caveats.map((caveat) => <li key={caveat}>{caveat}</li>)}</ul>
                      ) : null}
                    </article>
                  ))}
                  <div className="review-reference-list">
                    {item.references.map((reference) => (
                      <a key={reference.id} href={reference.url} target="_blank" rel="noreferrer">
                        {reference.publisher} · {reference.title} ↗
                      </a>
                    ))}
                  </div>
                </details>
              ) : null}

              <div className="review-card-links">
                {item.episodeUrl ? <a href={item.episodeUrl} target="_blank" rel="noreferrer">Ouvrir la vidéo ↗</a> : null}
                {item.arguments.map((argument) => (
                  <a key={argument.id} href={`/explorer#${argument.id}`}>Voir « {argument.title} » →</a>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
