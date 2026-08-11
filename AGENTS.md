# Instructions de contribution

## Priorités

1. Construire un outil utile et vérifiable avant d'ajouter de la génération massive.
2. Distinguer dans le modèle les sources, faits, estimations, arguments et formulations.
3. Conserver la provenance et l'incertitude dans toute transformation de données.
4. Refuser le profilage individuel et le ciblage politique fondé sur des données sensibles.

## Méthode

- Lire `docs/VISION.md`, `docs/ETHICS.md` et `docs/DECISIONS.md` avant une modification structurante.
- Ajouter une décision dans `docs/DECISIONS.md` lorsqu'un choix d'architecture engage la suite.
- Préférer un petit corpus réel et évalué à un grand corpus généré sans contrôle.
- Ajouter des tests avec les fonctionnalités métier.
- Exécuter `npm run lint` et `npm run build` avant publication.

## Conventions

- Interface et documentation en français.
- TypeScript strict et composants serveur par défaut.
- Aucun secret, jeton ou fichier `.env` dans Git.
- Pas de dépendance ou de service externe sans justification documentée.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
