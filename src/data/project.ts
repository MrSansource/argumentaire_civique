export const principles = [
  {
    title: "Sourcer avant d'affirmer",
    description:
      "Chaque fait renvoie à une source, une date et un niveau de confiance. Les estimations restent distinctes des observations.",
  },
  {
    title: "Composer plutôt que dupliquer",
    description:
      "Les arguments, objections et styles d'explication sont des briques réutilisables, pas une matrice infinie de textes figés.",
  },
  {
    title: "Préserver l'autonomie",
    description:
      "L'outil aide à comprendre et dialoguer. Il exclut le diagnostic individuel, la manipulation cachée et le ciblage sensible.",
  },
] as const;

export const dimensions = [
  {
    code: "A",
    title: "Rapports au monde",
    description:
      "Valeurs déclarées, confiance, sentiment d'efficacité et préférences de communication.",
    examples: ["Valeurs", "Confiance", "Optimisme", "Rapport à l'autorité"],
  },
  {
    code: "B",
    title: "Situations sociales",
    description:
      "Caractéristiques démographiques et contextes de vie, étudiés uniquement sous forme agrégée.",
    examples: ["Âge", "Territoire", "Structure familiale", "Environnement social"],
  },
  {
    code: "C",
    title: "Conditions économiques",
    description:
      "Ressources, contraintes matérielles et trajectoires qui structurent les expériences quotidiennes.",
    examples: ["Revenus", "Patrimoine", "Logement", "Travail"],
  },
  {
    code: "D",
    title: "Thèmes civiques",
    description:
      "Sujets autour desquels organiser faits, controverses, arguments, objections et ressources.",
    examples: ["Écologie", "IA & travail", "Économie", "Démocratie", "Sens"],
  },
] as const;

export const roadmap = [
  {
    title: "Socle et principes",
    description: "Formaliser la vision, les limites d'usage, les décisions et le vocabulaire partagé.",
    status: "Disponible",
  },
  {
    title: "Modèle éditorial",
    description: "Décrire sources, affirmations, arguments, objections, thèmes et relations entre objets.",
    status: "Disponible",
  },
  {
    title: "Explorateur",
    description: "Naviguer dans un petit corpus vérifié et filtrer les contenus par thème et contexte.",
    status: "Disponible",
  },
  {
    title: "Laboratoire population",
    description:
      "Comparer des croisements publiés, des estimations factorisées et leurs limites d'incertitude.",
    status: "Disponible",
  },
  {
    title: "Contribution",
    description: "Proposer une source ou un argument, comparer les versions et organiser la validation humaine.",
    status: "À suivre",
  },
  {
    title: "Assistance générative",
    description: "Composer des brouillons traçables à partir des briques validées, puis mesurer leur qualité.",
    status: "Plus tard",
  },
] as const;
