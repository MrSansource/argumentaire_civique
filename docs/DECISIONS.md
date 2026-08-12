# Journal des décisions

## D-001 — Application web Next.js

**Statut :** accepté provisoirement

Le premier socle utilise Next.js, TypeScript et l'App Router. Cette combinaison fournit un déploiement direct sur Vercel et permet de commencer par des pages statiques avant d'introduire une base de données.

## D-002 — Modèle factorisé

**Statut :** accepté

Les contenus sont séparés en sources, affirmations, arguments, objections et formulations. Une matrice exhaustive de tous les croisements n'est pas stockée.

## D-003 — Génération différée

**Statut :** accepté

Le MVP ne dépend pas d'un LLM. La génération sera introduite après la création d'un corpus évalué et d'un protocole de mesure.

## D-004 — Dépôt public

**Statut :** à confirmer

Le dépôt GitHub est actuellement public. Aucun secret, corpus sous licence restrictive ou donnée personnelle ne doit y être ajouté. La visibilité pourra être réévaluée avant l'import de corpus.

## D-005 — Stockage

**Statut :** ouvert

Le choix entre fichiers versionnés, PostgreSQL et approche hybride sera fait après validation du schéma et des workflows éditoriaux.

## D-006 — Transcriptions complètes hors Git

**Statut :** accepté

Les fichiers VTT, SRT et transcriptions canoniques complètes restent dans `.workbench/`, ignoré par Git. Le corpus publié ne conserve que les courts extraits nécessaires à la vérification, leurs horodatages et des paraphrases.

## D-007 — Analyse par lots traçables

**Statut :** accepté

Une vidéo est découpée en lots qui conservent les identifiants des segments. Toute affirmation candidate doit référencer ses segments. La génération ne peut attribuer elle-même un statut supérieur à `draft`.

## D-008 — Fichier JSON avant base de données

**Statut :** accepté provisoirement

Le corpus pilote utilise un fichier JSON validé par script. Cette solution rend le schéma révisable et vérifiable dans Git avant d'engager un choix de base de données et d'interface d'administration.

## D-009 — Observations avant factorisation

**Statut :** accepté

Le moteur de population privilégie les cellules directement publiées. Le produit des marges n'est présenté que comme une hypothèse d'indépendance explicite et comparable à l'observation lorsqu'elle existe. Les bornes de Fréchet accompagnent les estimations afin de montrer ce que les marges seules ne permettent pas de déduire.

## D-010 — Catalogue de dimensions avec statuts d'usage

**Statut :** accepté

Chaque nomenclature est versionnée et classée comme active, planifiée, réservée à la recherche ou restreinte. Le statut scientifique, les limites et les usages autorisés font partie du modèle. Une dimension psychologique controversée ne peut pas devenir un attribut de profil individuel ou un levier de ciblage politique.

## D-011 — GitHub Issues avant un backend éditorial

**Statut :** accepté provisoirement

Le premier flux de contribution produit un objet JSON local et ouvre, sur demande explicite, une issue GitHub préremplie. Cette solution rend la proposition, la discussion et l'historique publics sans collecter d'identité dans l'application ni introduire une base de données et une authentification avant d'avoir observé les besoins éditoriaux réels.

## D-012 — Proximité de formulation contrôlée par le lecteur

**Statut :** accepté provisoirement

Le premier moteur de factorisation classe les arguments selon quatre coordonnées éditoriales. Les réglages décrivent la discussion souhaitée et sont manipulés explicitement dans le navigateur ; aucune caractéristique personnelle n'est inférée ou persistée. Le score affiché est une proximité géométrique explicable, pas une prédiction de persuasion. Toute future génération de texte devra conserver les mêmes faits, objections, vérifications et garde-fous.
