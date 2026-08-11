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

### Argument

Unité de raisonnement reliant prémisses, conclusion, thème, intention et principales objections. Il référence des affirmations plutôt que recopier leurs données.

### Objection

Critique structurée d'un argument. Elle peut cibler une prémisse, une inférence, une source ou une conséquence normative.

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
