"use client";

import { useMemo, useState } from "react";
import {
  buildContributionProposal,
  buildGitHubIssueUrl,
  type ContributionInput,
} from "@/lib/contribution-proposal.mjs";

type Theme = { id: string; label: string };

type Props = {
  repositoryUrl: string;
  themes: Theme[];
};

const typeLabels = {
  source: "Nouvelle source",
  argument: "Argument structuré",
  correction: "Correction documentée",
} as const;

function createInitialDraft(themes: Theme[]): ContributionInput {
  return {
    type: "argument",
    themeId: themes[0]?.id ?? "",
    title: "",
    sourceUrl: "",
    summaryFr: "",
    evidenceFr: "",
    objectionFr: "",
    caveatsFr: "",
    publicSubmissionAcknowledged: false,
    noSensitiveTargetingAcknowledged: false,
  };
}

export function ContributionForm({ repositoryUrl, themes }: Props) {
  const [draft, setDraft] = useState(() => createInitialDraft(themes));
  const [attempted, setAttempted] = useState(false);
  const [feedback, setFeedback] = useState("");

  const validation = useMemo(() => {
    try {
      return { proposal: buildContributionProposal(draft), error: "" };
    } catch (error) {
      return {
        proposal: null,
        error: error instanceof Error ? error.message : "La proposition est invalide.",
      };
    }
  }, [draft]);

  const issueUrl = validation.proposal
    ? buildGitHubIssueUrl(repositoryUrl, validation.proposal)
    : null;

  function updateField<Key extends keyof ContributionInput>(
    key: Key,
    value: ContributionInput[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setFeedback("");
  }

  async function copyProposal() {
    if (!validation.proposal) {
      setAttempted(true);
      return;
    }
    await navigator.clipboard.writeText(JSON.stringify(validation.proposal, null, 2));
    setFeedback("Proposition copiée dans le presse-papiers.");
  }

  function downloadProposal() {
    if (!validation.proposal) {
      setAttempted(true);
      return;
    }
    const blob = new Blob([`${JSON.stringify(validation.proposal, null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "proposition-argumentaire-civique.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setFeedback("Fichier JSON téléchargé.");
  }

  return (
    <section className="contribution-workspace" aria-labelledby="contribution-form-title">
      <form
        className="contribution-form"
        onSubmit={(event) => {
          event.preventDefault();
          setAttempted(true);
        }}
      >
        <div className="contribution-form-heading">
          <p className="section-kicker">Étape 1 · Décrire</p>
          <h2 id="contribution-form-title">Une proposition contestable et vérifiable.</h2>
          <p>
            Aucun nom, courriel ou profil personnel n&apos;est demandé. Le contenu sera public si tu
            choisis d&apos;ouvrir l&apos;issue GitHub.
          </p>
        </div>

        <div className="contribution-field-grid">
          <label>
            Type de proposition
            <select
              value={draft.type}
              onChange={(event) => updateField("type", event.target.value)}
            >
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label>
            Thème principal
            <select
              value={draft.themeId}
              onChange={(event) => updateField("themeId", event.target.value)}
            >
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>{theme.label}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Titre
          <input
            value={draft.title}
            onChange={(event) => updateField("title", event.target.value)}
            minLength={12}
            maxLength={140}
            placeholder="Ex. Distinguer la hausse des revenus du coût du logement"
          />
          <small>12 à 140 caractères.</small>
        </label>

        <label>
          URL de la source
          <input
            type="url"
            value={draft.sourceUrl}
            onChange={(event) => updateField("sourceUrl", event.target.value)}
            placeholder="https://…"
          />
          <small>Facultative au brouillon, obligatoire avant validation éditoriale.</small>
        </label>

        <label>
          Résumé de la proposition
          <textarea
            value={draft.summaryFr}
            onChange={(event) => updateField("summaryFr", event.target.value)}
            minLength={80}
            maxLength={1_500}
            rows={6}
            placeholder="Formule la thèse, la correction ou l'intérêt de la source sans présumer de sa validation."
          />
        </label>

        <label>
          Justification et éléments à vérifier
          <textarea
            value={draft.evidenceFr}
            onChange={(event) => updateField("evidenceFr", event.target.value)}
            minLength={40}
            maxLength={1_500}
            rows={5}
            placeholder="Quels passages, données ou raisonnements soutiennent la proposition ? Que faut-il encore contrôler ?"
          />
        </label>

        <label>
          Objection la plus sérieuse
          <textarea
            value={draft.objectionFr}
            onChange={(event) => updateField("objectionFr", event.target.value)}
            minLength={40}
            maxLength={1_000}
            rows={4}
            placeholder="Quelle critique pourrait réellement changer ou limiter la proposition ?"
          />
        </label>

        <label>
          Limites supplémentaires
          <textarea
            value={draft.caveatsFr}
            onChange={(event) => updateField("caveatsFr", event.target.value)}
            maxLength={800}
            rows={3}
            placeholder="Champ géographique, période, incertitude, conflit de sources…"
          />
        </label>

        <fieldset className="contribution-policy">
          <legend>Garde-fous obligatoires</legend>
          <label>
            <input
              type="checkbox"
              checked={draft.publicSubmissionAcknowledged}
              onChange={(event) => updateField("publicSubmissionAcknowledged", event.target.checked)}
            />
            <span>Je comprends que l&apos;issue GitHub et son contenu seront publics.</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={draft.noSensitiveTargetingAcknowledged}
              onChange={(event) => updateField("noSensitiveTargetingAcknowledged", event.target.checked)}
            />
            <span>La proposition ne profile ni ne cible politiquement une personne selon des données sensibles.</span>
          </label>
        </fieldset>

        {attempted && validation.error ? (
          <p className="contribution-error" role="alert">{validation.error}</p>
        ) : null}

        <div className="contribution-actions">
          <button className="button button-primary" type="submit">
            Vérifier la proposition
          </button>
          <button className="button button-secondary" type="button" onClick={copyProposal}>
            Copier le JSON
          </button>
          <button className="button button-secondary" type="button" onClick={downloadProposal}>
            Télécharger
          </button>
        </div>
      </form>

      <aside className="contribution-preview" aria-live="polite">
        <p className="section-kicker">Étape 2 · Relire</p>
        <h2>Aperçu structuré</h2>
        {validation.proposal ? (
          <>
            <div className="proposal-status">Prête à proposer · pas encore validée</div>
            <dl>
              <div><dt>Type</dt><dd>{typeLabels[validation.proposal.type as keyof typeof typeLabels]}</dd></div>
              <div><dt>Thème</dt><dd>{themes.find((item) => item.id === validation.proposal?.themeId)?.label}</dd></div>
              <div><dt>Source</dt><dd>{validation.proposal.sourceUrl ? "Fournie" : "À documenter"}</dd></div>
              <div><dt>Statut</dt><dd>Proposée</dd></div>
            </dl>
            <pre>{JSON.stringify(validation.proposal, null, 2)}</pre>
            <a
              className="button button-primary contribution-github-button"
              href={issueUrl ?? undefined}
              target="_blank"
              rel="noreferrer"
            >
              Ouvrir l&apos;issue GitHub ↗
            </a>
            <p className="contribution-preview-note">
              Cette action ouvre un brouillon prérempli. Rien n&apos;est publié avant ta confirmation sur GitHub.
            </p>
          </>
        ) : (
          <div className="contribution-empty-preview">
            <span>JSON</span>
            <p>Complète les champs et accepte les garde-fous pour générer une proposition.</p>
          </div>
        )}
        {feedback ? <p className="contribution-feedback">{feedback}</p> : null}
      </aside>
    </section>
  );
}
