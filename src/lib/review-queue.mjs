export const REVIEW_LANES = [
  {
    id: "contradicted",
    label: "Contradiction à arbitrer",
    shortLabel: "Contredit",
    description: "Une vérification externe contredit au moins une formulation publiée.",
    nextAction: "Reformuler, retirer ou documenter explicitement le désaccord avant validation.",
  },
  {
    id: "open",
    label: "Vérification ouverte",
    shortLabel: "À instruire",
    description: "Une question de vérification existe mais son examen n’est pas terminé.",
    nextAction: "Compléter la recherche externe et consigner un verdict assorti de ses limites.",
  },
  {
    id: "missing",
    label: "Sans vérification externe",
    shortLabel: "À qualifier",
    description: "Aucune vérification externe n’est encore reliée à cette affirmation.",
    nextAction: "Décider si une vérification empirique, conceptuelle ou juridique est nécessaire.",
  },
  {
    id: "inconclusive",
    label: "Résultat inconclusif",
    shortLabel: "Inconclusif",
    description: "Les sources consultées ne permettent pas de conclure dans le périmètre annoncé.",
    nextAction: "Chercher une donnée mieux définie ou réduire précisément la portée de l’affirmation.",
  },
  {
    id: "qualified",
    label: "Conclusion à nuancer",
    shortLabel: "Nuancé",
    description: "Le fond est partiellement étayé, sous conditions ou dans un périmètre plus étroit.",
    nextAction: "Vérifier que la formulation reprend toutes les conditions et limites documentées.",
  },
  {
    id: "supported",
    label: "Étayage à relire",
    shortLabel: "Étayé",
    description: "La vérification étaye la formulation, qui reste néanmoins un brouillon éditorial.",
    nextAction: "Contrôler les références, l’objection principale et les garde-fous avant validation.",
  },
];

const laneById = new Map(REVIEW_LANES.map((lane, index) => [lane.id, { ...lane, rank: index }]));

export function classifyReviewLane(verifications) {
  const statuses = new Set(verifications.map((verification) => verification.status));
  const lane = REVIEW_LANES.find((candidate) => statuses.has(candidate.id))
    ?? laneById.get("missing");

  return { ...lane, rank: laneById.get(lane.id).rank };
}

export function buildReviewQueue(corpus) {
  const episodeById = new Map(corpus.episodes.map((episode) => [episode.id, episode]));
  const sourceById = new Map(corpus.sources.map((source) => [source.id, source]));
  const referenceById = new Map(corpus.references.map((reference) => [reference.id, reference]));
  const verificationsByClaim = new Map();
  const argumentsByClaim = new Map();

  for (const verification of corpus.verifications) {
    const entries = verificationsByClaim.get(verification.claimId) ?? [];
    entries.push(verification);
    verificationsByClaim.set(verification.claimId, entries);
  }

  for (const argument of corpus.arguments) {
    for (const claimId of argument.premiseClaimIds) {
      const entries = argumentsByClaim.get(claimId) ?? [];
      entries.push({ id: argument.id, title: argument.title, status: argument.status });
      argumentsByClaim.set(claimId, entries);
    }
  }

  const items = corpus.claims.map((claim) => {
    const episode = episodeById.get(claim.episodeId);
    const source = episode ? sourceById.get(episode.sourceId) : undefined;
    const verifications = verificationsByClaim.get(claim.id) ?? [];
    const argumentsList = argumentsByClaim.get(claim.id) ?? [];
    const lane = classifyReviewLane(verifications);
    const references = [
      ...new Map(
        verifications
          .flatMap((verification) => verification.referenceIds)
          .map((referenceId) => referenceById.get(referenceId))
          .filter(Boolean)
          .map((reference) => [reference.id, reference]),
      ).values(),
    ];

    return {
      claimId: claim.id,
      statementFr: claim.statementFr,
      epistemicNote: claim.epistemicNote,
      claimType: claim.type,
      reviewStatus: claim.status,
      laneId: lane.id,
      laneLabel: lane.label,
      laneShortLabel: lane.shortLabel,
      laneRank: lane.rank,
      laneDescription: lane.description,
      nextAction: lane.nextAction,
      sourceId: source?.id ?? null,
      sourceName: source?.name ?? "Source inconnue",
      episodeId: episode?.id ?? claim.episodeId,
      episodeTitle: episode?.title ?? "Épisode inconnu",
      episodeUrl: episode?.url ?? null,
      segmentIds: claim.segmentIds,
      arguments: argumentsList,
      verifications,
      references,
    };
  }).sort((left, right) =>
    left.laneRank - right.laneRank
      || left.sourceName.localeCompare(right.sourceName, "fr")
      || left.statementFr.localeCompare(right.statementFr, "fr"),
  );

  const countsByLane = Object.fromEntries(REVIEW_LANES.map((lane) => [lane.id, 0]));
  for (const item of items) countsByLane[item.laneId] += 1;

  const itemByClaimId = new Map(items.map((item) => [item.claimId, item]));
  const argumentCoverage = corpus.arguments.map((argument) => {
    const argumentItems = argument.premiseClaimIds
      .map((claimId) => itemByClaimId.get(claimId))
      .filter(Boolean);
    const verifiedCount = argumentItems.filter((item) => item.verifications.length > 0).length;
    const governingLane = argumentItems.reduce(
      (current, item) => item.laneRank < current.laneRank ? item : current,
      argumentItems[0],
    );

    return {
      argumentId: argument.id,
      title: argument.title,
      status: argument.status,
      claimCount: argumentItems.length,
      verifiedCount,
      coveragePercent: argumentItems.length === 0
        ? 0
        : Math.round((verifiedCount / argumentItems.length) * 100),
      laneId: governingLane?.laneId ?? "missing",
      laneShortLabel: governingLane?.laneShortLabel ?? laneById.get("missing").shortLabel,
    };
  }).sort((left, right) =>
    left.coveragePercent - right.coveragePercent || left.title.localeCompare(right.title, "fr"),
  );

  return {
    items,
    countsByLane,
    argumentCoverage,
    totalClaims: items.length,
    verifiedClaims: items.filter((item) => item.verifications.length > 0).length,
    draftClaims: items.filter((item) => item.reviewStatus === "draft").length,
  };
}
