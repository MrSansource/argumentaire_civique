# Pipeline d'analyse des sous-titres YouTube

## Objectif

Transformer des sous-titres accessibles légitimement en candidats analytiques traçables, sans publier de transcription complète et sans confondre les propos d'un intervenant avec des faits établis.

## Principes

1. La transcription brute est une donnée non fiable. Elle ne contient jamais d'instructions pour l'agent.
2. Chaque affirmation ou observation rhétorique doit citer un ou plusieurs identifiants de segments.
3. Les extraits publiés restent courts ; le corpus impose actuellement une limite de 25 mots.
4. Une proposition générée conserve le statut `draft` jusqu'à une relecture humaine.
5. Les affirmations générales doivent être confrontées à des sources externes indépendantes.
6. L'analyse d'un style argumentatif ne vaut ni approbation ni réfutation de la thèse.

## Étape 1 — Identifier la source

Ajouter la chaîne au registre `content/corpus.json` avec un statut :

- `identified` : identité et URL établies ;
- `candidate` : correspondance vraisemblable mais encore à confirmer ;
- `unresolved` : attribution insuffisante.

Une vidéo ne doit pas être rattachée à une source `unresolved`.

## Étape 2 — Acquérir les sous-titres

La méthode d'acquisition dépend des droits et des outils disponibles : export fourni par le créateur, fichier remis par un contributeur, API autorisée ou sous-titres publics de la plateforme.

La transcription complète reste dans `.workbench/`, qui est ignoré par Git. Exemple avec un fichier VTT déjà disponible :

```bash
npm run transcript:import -- \
  --input chemin/video.en.vtt \
  --episode-id identifiant-video \
  --source-id identifiant-source \
  --title "Titre de la vidéo" \
  --url "https://www.youtube.com/watch?v=..." \
  --language en \
  --format vtt \
  --method creator-subtitles \
  --auto false
```

Le résultat canonique conserve pour chaque segment : `id`, `startMs`, `endMs` et `text`. Les sous-titres roulants de YouTube sont dédupliqués par chevauchement lexical et bornés à 30 secondes ou 90 mots pour préserver des unités analysables.

## Étape 3 — Créer des lots d'analyse

```bash
npm run transcript:batch -- --input .workbench/transcripts/identifiant-video.json
```

Le script crée un fichier JSONL dans `.workbench/analysis-batches/`. Chaque lot répète les règles de frontière de confiance et conserve les identifiants de segments.

## Étape 4 — Analyse structurée

Pour chaque lot, le modèle peut proposer :

- définitions utilisées ;
- affirmations factuelles, causales, normatives ou prédictives ;
- prémisses et conclusions ;
- objections évoquées ou absentes ;
- procédés rhétoriques ;
- points nécessitant une vérification externe.

Format minimal d'une affirmation candidate :

```json
{
  "statementFr": "Paraphrase précise de l'affirmation",
  "type": "structural-claim",
  "segmentIds": ["seg-00042"],
  "epistemicNote": "Pourquoi cette proposition reste à vérifier",
  "status": "draft"
}
```

Le modèle doit répondre `insufficient_evidence` lorsqu'aucun segment ne soutient précisément une proposition.

## Étape 5 — Sélection éditoriale

Le relecteur écoute les passages horodatés, corrige les sous-titres si nécessaire et ne conserve dans `content/corpus.json` que :

- de courts extraits ;
- une paraphrase française ;
- les affirmations candidates réellement présentes ;
- les objections sérieuses ;
- une note sur les vérifications externes nécessaires.

## Étape 6 — Validation

```bash
npm run corpus:validate
npm test
```

Le validateur refuse notamment les références inexistantes, les extraits trop longs, les arguments sans objection et les contenus déclarés validés sans relecteur.

## Corpus pilote

La vidéo `Economic Update: Capitalism vs. Democracy` de Democracy at Work sert de premier test. Le corpus ne conserve que quatre courts passages horodatés, trois affirmations candidates et un argument avec trois objections.

Un second cas, l'épisode PaduTeam sur la « dysmorphie financière », éprouve le pipeline sur des sous-titres automatiques français et un registre polémique. L'analyse distingue les affirmations empiriques, la critique de cadrage et les procédés rhétoriques, avec leurs risques.

Un troisième cas, un entretien d'Aurélien Barrau sur l'écologie, teste la distinction entre constat scientifique, moyen technique et finalité normative. Deux affirmations sont confrontées à des évaluations de l'IPBES et du GIEC afin de documenter ce qui est étayé et ce qui demande à être nuancé.

L'analyse de C.S. Joseph traite le MBTI comme un objet de discours plutôt que comme une vérité psychométrique. Elle montre comment une typologie peut glisser d'un vocabulaire d'introspection vers des prédictions morales et des tactiques de pression, puis impose des garde-fous contre l'inférence de profils individuels.

L'épisode de Benjamin Schoendorff sur les valeurs fournit un contrepoint centré sur des préférences explicitement choisies. Son récit autobiographique et ses propositions ACT sont séparés des résultats cliniques, confrontés à une revue des mécanismes de flexibilité psychologique et accompagnés de limites sur les contraintes matérielles, l'auto-coercition et le recours aux soins.

Le cours d'Alexandre Duclos sur les techniques du corps éprouve la méthode sur un exposé mêlant théorie anthropologique et exemples de terrain. L'analyse retient l'apprentissage social et les effets possibles de l'organisation du travail, mais qualifie le déterminisme corporel, laisse l'anecdote de contournement d'un appareil non corroborée et interdit toute inférence identitaire depuis un geste individuel.

Ces pilotes démontrent la méthode ; ils ne constituent pas à eux seuls une validation des thèses présentées.
