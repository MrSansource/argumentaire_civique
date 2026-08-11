const ALLOWED_TYPES = new Set(["source", "argument", "correction"]);
const ALLOWED_THEME_IDS = new Set([
  "democratie-travail",
  "economie",
  "pauvrete-inegalites",
  "ecologie",
  "sens-vie",
  "ia-travail",
  "impuissance-politique",
  "culture-pouvoir",
]);

function cleanText(value) {
  return typeof value === "string" ? value.trim().replace(/\r\n/g, "\n") : "";
}

function assertLength(value, label, minimum, maximum) {
  if (value.length < minimum || value.length > maximum) {
    throw new Error(`${label} doit contenir entre ${minimum} et ${maximum} caractères.`);
  }
}

function normalizeUrl(value) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;
  let url;
  try {
    url = new URL(cleaned);
  } catch {
    throw new Error("L’URL de source est invalide.");
  }
  if (!new Set(["http:", "https:"]).has(url.protocol)) {
    throw new Error("L’URL de source doit utiliser HTTP ou HTTPS.");
  }
  return url.toString();
}

export function buildContributionProposal(input) {
  const type = cleanText(input.type);
  const themeId = cleanText(input.themeId);
  const title = cleanText(input.title);
  const summaryFr = cleanText(input.summaryFr);
  const evidenceFr = cleanText(input.evidenceFr);
  const objectionFr = cleanText(input.objectionFr);
  const caveatsFr = cleanText(input.caveatsFr);

  if (!ALLOWED_TYPES.has(type)) throw new Error("Le type de contribution est invalide.");
  if (!ALLOWED_THEME_IDS.has(themeId)) throw new Error("Le thème est invalide.");
  assertLength(title, "Le titre", 12, 140);
  assertLength(summaryFr, "Le résumé", 80, 1_500);
  assertLength(evidenceFr, "La justification", 40, 1_500);
  assertLength(objectionFr, "L’objection", 40, 1_000);
  if (caveatsFr) assertLength(caveatsFr, "Les limites", 20, 800);
  if (!input.publicSubmissionAcknowledged) {
    throw new Error("La publication publique doit être explicitement acceptée.");
  }
  if (!input.noSensitiveTargetingAcknowledged) {
    throw new Error("L’interdiction du ciblage sensible doit être explicitement acceptée.");
  }

  return {
    schemaVersion: 1,
    type,
    title,
    themeId,
    sourceUrl: normalizeUrl(input.sourceUrl),
    summaryFr,
    evidenceFr,
    objectionFr,
    caveatsFr: caveatsFr || null,
    policy: {
      publicSubmissionAcknowledged: true,
      noSensitiveTargetingAcknowledged: true,
      containsPersonalData: false,
    },
    status: "proposed",
  };
}

export function formatContributionIssue(proposal) {
  const safeJson = JSON.stringify(proposal, null, 2).replaceAll("`", "\\u0060");
  return [
    "## Proposition structurée",
    "",
    `**Type :** ${proposal.type}`,
    `**Thème :** ${proposal.themeId}`,
    proposal.sourceUrl ? `**Source :** ${proposal.sourceUrl}` : "**Source :** à documenter",
    "",
    "<details>",
    "<summary>Données de la proposition</summary>",
    "",
    "```json",
    safeJson,
    "```",
    "</details>",
    "",
    "### Relecture attendue",
    "- [ ] Contrôler la source et son contexte",
    "- [ ] Distinguer faits, interprétations et normes",
    "- [ ] Examiner l’objection avant intégration",
    "- [ ] Vérifier l’absence de ciblage individuel sensible",
  ].join("\n");
}

export function buildGitHubIssueUrl(repositoryUrl, proposal) {
  const url = new URL(`${repositoryUrl.replace(/\/$/, "")}/issues/new`);
  url.searchParams.set("title", `[Contribution] ${proposal.title}`);
  url.searchParams.set("body", formatContributionIssue(proposal));
  return url.toString();
}
