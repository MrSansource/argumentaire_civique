# Modèle de données initial

## Approche recommandée

Le modèle est factorisé. Il évite une table contenant un texte pour chaque croisement de nomenclatures et de thèmes.

## Entités principales

### Source

Document, jeu de données, vidéo, transcription ou page web. Contient l'auteur, la date, l'URL, le type, la licence et la date de consultation.

### Extrait

Passage ou segment précisément localisé dans une source. Il permet de rattacher une affirmation à une preuve vérifiable.

### Affirmation

Proposition factuelle ou interprétative. Elle porte un type, un niveau de confiance, un statut de validation et des liens vers ses extraits justificatifs ou contradictoires.

### Vérification

Question éditoriale reliant une affirmation à des références externes. Son verdict peut étayer, nuancer ou contredire la formulation initiale ; il conserve le périmètre des données et les limites de comparaison.

### Argument

Unité de raisonnement reliant prémisses, conclusion, thème, intention et principales objections. Il référence des affirmations plutôt que recopier leurs données.

### Objection

Critique structurée d'un argument. Elle peut cibler une prémisse, une inférence, une source ou une conséquence normative.

### Procédé rhétorique

Description sourcée d'un choix de langage ou de cadrage. Elle sépare l'effet recherché ou observable de son risque argumentatif et reste liée aux passages concernés.

### Formulation

Présentation d'un argument selon un registre, une longueur, un niveau de technicité et un contexte de dialogue. Elle ne modifie pas les faits sous-jacents.

### Dimension et catégorie

Une dimension est une nomenclature versionnée. Ses catégories documentent leurs définitions, limites, sources et statut scientifique.

### Estimation de population

Valeur agrégée reliant des catégories à une zone, une période, une méthode, des hypothèses et un intervalle d'incertitude.

## Relations importantes

```text
Source -> Extrait -> Affirmation -> Argument -> Formulation
                          |             |
                          v             v
                     Contradiction   Objection

Dimension -> Catégorie -> Estimation de population
Dimension -> Catégorie -> Règle d'adaptation explicite
```

## Conséquence

La génération à la demande sélectionne des arguments validés, récupère leurs preuves et applique des règles de formulation explicites. Elle ne fabrique pas une vérité différente pour chaque public.

## Implémentation pilote

Le fichier `content/corpus.json` constitue la première représentation portable du modèle. Il contient les sources repérées, des épisodes pilotes, de courts segments horodatés, des affirmations candidates, des arguments structurés et, lorsque c'est pertinent, leurs procédés rhétoriques.

La transcription complète n'est jamais un champ du corpus publié. Elle reste dans `.workbench/` pendant le traitement, puis seuls les extraits nécessaires et leurs paraphrases sont promus.

Les invariants sont vérifiés par `scripts/validate-corpus.mjs` avant publication. Une base de données remplacera éventuellement ce fichier lorsque les workflows d'édition seront stabilisés.
