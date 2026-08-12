# Argumentaire civique

Une base collaborative pour relier données de population agrégées, thèmes civiques, arguments sourcés et styles d'explication.

Le projet est dans une phase de prototype. Le site rend visibles sa méthode, ses limites, un corpus argumentatif pilote et un premier laboratoire de croisements démographiques.

## Modules disponibles

- `/explorer` : parcourir les sources, affirmations, arguments, objections et vérifications externes ;
- `/relecture` : prioriser les affirmations à revoir et repérer les thèmes absents ou dépendants d'une seule source ;
- `/population` : comparer une table Insee directement publiée à une estimation sous hypothèse d'indépendance et aux bornes logiques permises par les marges.
- `/contribuer` : préparer une proposition structurée, l'exporter localement ou ouvrir une issue GitHub préremplie pour relecture.

## Principes

- distinguer faits, estimations, hypothèses et opinions ;
- conserver la source, la date et le niveau de confiance de chaque affirmation ;
- composer des contenus à partir de briques réutilisables plutôt que préproduire une matrice exhaustive ;
- ne pas diagnostiquer, profiler ou cibler politiquement une personne à partir de données sensibles ;
- soumettre les contenus générés à une validation humaine et à des évaluations reproductibles.

## Démarrage local

```bash
npm install
npm run dev
```

Le site est alors disponible sur [http://localhost:3000](http://localhost:3000).

## Validation

```bash
npm test
npm run corpus:validate
npm run population:validate
npm run lint
npm run build
```

## Analyse de sous-titres

Les transcriptions complètes restent dans `.workbench/` et ne sont jamais publiées. Le pipeline d'import, de découpage et de validation est décrit dans [docs/YOUTUBE_PIPELINE.md](docs/YOUTUBE_PIPELINE.md).

```bash
npm run transcript:import -- --input video.vtt --episode-id video-test --source-id source-test --title "Titre" --url "https://www.youtube.com/watch?v=..." --language fr
npm run transcript:batch -- --input .workbench/transcripts/video-test.json
```

## Documentation

- [Vision](docs/VISION.md)
- [Principes éthiques](docs/ETHICS.md)
- [Modèle de données](docs/DATA_MODEL.md)
- [Périmètre du MVP](docs/MVP.md)
- [Pipeline YouTube](docs/YOUTUBE_PIPELINE.md)
- [Cycle de contribution](docs/CONTRIBUTING.md)
- [Journal des décisions](docs/DECISIONS.md)

## État

`v0.2` — corpus pilote, vérifications externes et laboratoire de population.
