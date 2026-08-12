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

### Profil de formulation

Annotation éditoriale continue d'un argument sur des axes de présentation. Le pilote utilise quatre spectres : faits/valeurs, individuel/systémique, comprendre/agir et accessible/technique. Ces coordonnées décrivent le contenu, jamais une personne. Elles permettent un classement par proximité lorsque le lecteur règle lui-même la discussion recherchée.

### Dimension et catégorie

Une dimension est une nomenclature versionnée. Ses catégories documentent leurs définitions, limites, sources et statut scientifique.

### Estimation de population

Valeur agrégée reliant des catégories à une zone, une période, une méthode, des hypothèses et un intervalle d'incertitude.

### Observation de population

Cellule ou marge directement publiée par un producteur statistique. Elle conserve son unité, sa date de mesure, sa géographie, son statut et sa règle d'arrondi. Une observation publiée reste une estimation statistique lorsqu'elle provient d'une estimation de population.

## Relations importantes

```text
Source -> Extrait -> Affirmation -> Argument -> Formulation
                          |             |
                          v             v
                     Contradiction   Objection

Dimension -> Catégorie -> Estimation de population
Dimension -> Catégorie -> Règle d'adaptation explicite
```

## Croisements de population

Le fichier `content/population.json` contient des dimensions versionnées et des jeux de données agrégés. Une dimension porte un statut d'usage :

- `active` : définition et données suffisantes pour le laboratoire ;
- `planned` : nomenclature envisagée, mais non exploitable ;
- `research-only` : objet d'étude sans usage de personnalisation ;
- `restricted` : usage limité à des statistiques agrégées explicitement justifiées.

Lorsqu'une cellule croisée est publiée, elle est prioritaire. Lorsque seules les marges sont disponibles, le produit des proportions peut servir de scénario d'indépendance, jamais d'observation. Les bornes de Fréchet indiquent l'intervalle logique compatible avec les seules marges et rendent visible l'information manquante.

Le pilote utilise la table Insee 2026 par groupe d'âge et sexe statistique : 28 cellules publiées, en milliers, avec des arrondis séparés. Le validateur tolère donc les petits écarts de sommation induits par cet arrondi.

## Conséquence

La génération à la demande sélectionne des arguments validés, récupère leurs preuves et applique des règles de formulation explicites. Elle ne fabrique pas une vérité différente pour chaque public.

## Factorisation des formulations

Le fichier `content/formulation-profiles.json` sépare les coordonnées éditoriales du corpus argumentaire. Le moteur calcule une distance euclidienne normalisée sur les quatre axes et affiche les axes les plus proches pour rendre le classement explicable.

Les valeurs de 0 à 100 ne sont ni des probabilités d'efficacité, ni des mesures psychométriques, ni des attributs d'un interlocuteur. Les réglages sont choisis localement par le lecteur, ne sont pas persistés et peuvent être remis à l'équilibre à tout moment. Un filtre thématique peut réduire le corpus avant le calcul, sans modifier les arguments.

## Implémentation pilote

Le fichier `content/corpus.json` constitue la première représentation portable du modèle. Il contient les sources repérées, des épisodes pilotes, de courts segments horodatés, des affirmations candidates, des arguments structurés et, lorsque c'est pertinent, leurs procédés rhétoriques.

La transcription complète n'est jamais un champ du corpus publié. Elle reste dans `.workbench/` pendant le traitement, puis seuls les extraits nécessaires et leurs paraphrases sont promus.

Les invariants sont vérifiés par `scripts/validate-corpus.mjs` et `scripts/validate-population.mjs` avant publication. Une base de données remplacera éventuellement ces fichiers lorsque les workflows d'édition seront stabilisés.

## File de révision

La route `/relecture` dérive une file de travail sans dupliquer d'état dans le corpus. Chaque affirmation est classée selon la situation de vérification la plus prudente : contradiction, question ouverte, absence de vérification, résultat inconclusif, conclusion nuancée ou étayage. La couverture d'un argument mesure uniquement le nombre de prémisses reliées à au moins une vérification externe ; elle ne mesure ni sa vérité ni sa force persuasive.
