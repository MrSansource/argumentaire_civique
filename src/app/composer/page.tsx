import type { Metadata } from "next";
import Link from "next/link";
import { ArgumentComposer } from "@/components/argument-composer";
import { corpus } from "@/lib/corpus";
import { formulationCatalog } from "@/lib/formulations";

export const metadata: Metadata = {
  title: "Composer une discussion · Argumentaire civique",
  description: "Classer les arguments selon des préférences conversationnelles explicites, sans profilage individuel.",
};

export default function ComposerPage() {
  return (
    <main className="composer-page">
      <header className="site-header composer-header">
        <Link className="brand" href="/" aria-label="Argumentaire civique — accueil">
          <span className="brand-mark">AC</span>
          <span>Argumentaire civique</span>
        </Link>
        <nav aria-label="Navigation de l’atelier">
          <Link href="/explorer">Corpus</Link>
          <Link href="/population">Population</Link>
          <Link href="/relecture">Relire</Link>
        </nav>
        <Link className="github-link" href="/">← Retour au manifeste</Link>
      </header>

      <section className="composer-hero">
        <p className="section-kicker">Factorisation pilote · sans IA</p>
        <h1>Choisir un angle,<br /><em>pas assigner une personne.</em></h1>
        <p>
          Réglez la discussion souhaitée. Le moteur compare ces choix aux annotations du corpus,
          explique ses résultats et laisse intacts les faits, objections et garde-fous.
        </p>
      </section>

      <ArgumentComposer
        argumentsList={corpus.arguments}
        axes={formulationCatalog.axes}
        profiles={formulationCatalog.profiles}
        themes={corpus.themes}
      />
    </main>
  );
}
