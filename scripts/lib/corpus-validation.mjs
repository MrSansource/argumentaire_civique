import { wordCount } from "./transcript.mjs";

const ALLOWED_SOURCE_STATUSES = new Set(["identified", "candidate", "unresolved"]);
const ALLOWED_REVIEW_STATUSES = new Set(["draft", "reviewed", "validated", "rejected"]);

export function validateCorpus(corpus) {
  const errors = [];
  const idSets = new Map();

  const collection = (name) => {
    const value = corpus[name];
    if (!Array.isArray(value)) {
      errors.push(`${name} doit être un tableau.`);
      return [];
    }
    return value;
  };

  const indexIds = (name, values) => {
    const ids = new Set();
    for (const value of values) {
      if (!value?.id || typeof value.id !== "string") {
        errors.push(`${name} contient un objet sans id.`);
        continue;
      }
      if (ids.has(value.id)) errors.push(`${name} contient l'id dupliqué ${value.id}.`);
      ids.add(value.id);
    }
    idSets.set(name, ids);
    return ids;
  };

  const sources = collection("sources");
  const episodes = collection("episodes");
  const claims = collection("claims");
  const argumentsList = collection("arguments");
  const themes = collection("themes");

  const sourceIds = indexIds("sources", sources);
  const episodeIds = indexIds("episodes", episodes);
  const claimIds = indexIds("claims", claims);
  indexIds("arguments", argumentsList);
  const themeIds = indexIds("themes", themes);

  for (const source of sources) {
    if (!ALLOWED_SOURCE_STATUSES.has(source.status)) {
      errors.push(`Source ${source.id} : statut invalide ${source.status}.`);
    }
    if (source.url) {
      try {
        new URL(source.url);
      } catch {
        errors.push(`Source ${source.id} : URL invalide.`);
      }
    }
  }

  const segmentIds = new Set();
  for (const episode of episodes) {
    if (!sourceIds.has(episode.sourceId)) {
      errors.push(`Épisode ${episode.id} : source inconnue ${episode.sourceId}.`);
    }
    if (Object.hasOwn(episode, "fullTranscript")) {
      errors.push(`Épisode ${episode.id} : fullTranscript est interdit dans le corpus publié.`);
    }
    if (episode.transcript?.retention !== "short-excerpts-only") {
      errors.push(`Épisode ${episode.id} : la rétention doit être short-excerpts-only.`);
    }
    if (
      episode.transcript?.kind === "youtube-auto-captions" &&
      !episode.transcript.reliabilityNote
    ) {
      errors.push(`Épisode ${episode.id} : note de fiabilité absente pour les sous-titres automatiques.`);
    }
    let previousStart = -1;
    for (const segment of episode.segments ?? []) {
      if (segmentIds.has(segment.id)) errors.push(`Segment dupliqué ${segment.id}.`);
      segmentIds.add(segment.id);
      if (segment.startMs < previousStart || segment.endMs <= segment.startMs) {
        errors.push(`Segment ${segment.id} : horodatage invalide ou désordonné.`);
      }
      previousStart = segment.startMs;
      if (wordCount(segment.excerpt) > 25) {
        errors.push(`Segment ${segment.id} : l'extrait dépasse 25 mots.`);
      }
      if (!segment.paraphraseFr) errors.push(`Segment ${segment.id} : paraphrase française absente.`);
    }
  }

  for (const claim of claims) {
    if (!ALLOWED_REVIEW_STATUSES.has(claim.status)) {
      errors.push(`Affirmation ${claim.id} : statut invalide ${claim.status}.`);
    }
    if (!episodeIds.has(claim.episodeId)) {
      errors.push(`Affirmation ${claim.id} : épisode inconnu ${claim.episodeId}.`);
    }
    if (!claim.segmentIds?.length) {
      errors.push(`Affirmation ${claim.id} : au moins un segment est requis.`);
    }
    for (const segmentId of claim.segmentIds ?? []) {
      if (!segmentIds.has(segmentId)) {
        errors.push(`Affirmation ${claim.id} : segment inconnu ${segmentId}.`);
      }
    }
    if (claim.status === "validated" && !claim.review?.reviewedBy) {
      errors.push(`Affirmation ${claim.id} : validation sans relecteur.`);
    }
  }

  for (const argument of argumentsList) {
    if (!ALLOWED_REVIEW_STATUSES.has(argument.status)) {
      errors.push(`Argument ${argument.id} : statut invalide ${argument.status}.`);
    }
    for (const claimId of argument.premiseClaimIds ?? []) {
      if (!claimIds.has(claimId)) {
        errors.push(`Argument ${argument.id} : prémisse inconnue ${claimId}.`);
      }
    }
    for (const themeId of argument.themeIds ?? []) {
      if (!themeIds.has(themeId)) {
        errors.push(`Argument ${argument.id} : thème inconnu ${themeId}.`);
      }
    }
    if (!argument.objections?.length) {
      errors.push(`Argument ${argument.id} : au moins une objection sérieuse est requise.`);
    }
    for (const move of argument.rhetoricalMoves ?? []) {
      if (!move.device || !move.effectFr || !move.riskFr) {
        errors.push(`Argument ${argument.id} : procédé rhétorique incomplet.`);
      }
      if (!move.segmentIds?.length) {
        errors.push(`Argument ${argument.id} : procédé rhétorique sans passage source.`);
      }
      for (const segmentId of move.segmentIds ?? []) {
        if (!segmentIds.has(segmentId)) {
          errors.push(`Argument ${argument.id} : procédé rhétorique lié à un segment inconnu ${segmentId}.`);
        }
      }
    }
  }

  return errors;
}
