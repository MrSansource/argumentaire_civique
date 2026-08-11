# Argumentaire civique

Une base collaborative pour relier données de population agrégées, thèmes civiques, arguments sourcés et styles d'explication.

Le projet est dans une phase de cadrage. Le site actuel rend visibles sa méthode, ses limites et sa feuille de route avant le développement de fonctions éditoriales ou génératives.

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
npm run lint
npm run build
```

## Documentation

- [Vision](docs/VISION.md)
- [Principes éthiques](docs/ETHICS.md)
- [Modèle de données](docs/DATA_MODEL.md)
- [Périmètre du MVP](docs/MVP.md)
- [Journal des décisions](docs/DECISIONS.md)

## État

`v0.1` — socle web et cadrage initial.
