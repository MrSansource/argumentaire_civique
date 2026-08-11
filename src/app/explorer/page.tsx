import type { Metadata } from "next";
import Link from "next/link";
import { CorpusExplorer } from "@/components/corpus-explorer";
import { corpus } from "@/lib/corpus";

export const metadata: Metadata = {
  title: "Explorer le corpus · Argumentaire civique",
  description: "Explorer les premiers arguments, objections, sources et passages horodatés du projet.",
};

export default function ExplorerPage() {
  return (
    <main className="explorer-page">
      <header className="site-header explorer-header">
        <Link className="brand" href="/" aria-label="Argumentaire civique — accueil">
          <span className="brand-mark">AC</span>
          <span>Argumentaire civique</span>
        </Link>
        <Link className="github-link" href="/">
          ← Retour au manifeste
        </Link>
      </header>

      <section className="explorer-hero">
        <p className="section-kicker">Corpus expérimental</p>
        <h1>Arguments, objections et preuves au même endroit.</h1>
        <p>
          Chaque idée reste reliée à des passages horodatés. Les statuts indiquent ce qui est
          encore à vérifier, discuter ou valider collectivement.
        </p>
        <dl>
          <div>
            <dt>{corpus.sources.length}</dt>
            <dd>sources repérées</dd>
          </div>
          <div>
            <dt>{corpus.episodes.length}</dt>
            <dd>
              vidéo{corpus.episodes.length > 1 ? "s" : ""} analysée
              {corpus.episodes.length > 1 ? "s" : ""}
            </dd>
          </div>
          <div>
            <dt>{corpus.claims.length}</dt>
            <dd>affirmations candidates</dd>
          </div>
          <div>
            <dt>{corpus.arguments.length}</dt>
            <dd>
              argument{corpus.arguments.length > 1 ? "s" : ""} structuré
              {corpus.arguments.length > 1 ? "s" : ""}
            </dd>
          </div>
        </dl>
      </section>

      <CorpusExplorer
        argumentsList={corpus.arguments}
        claims={corpus.claims}
        episodes={corpus.episodes}
        sources={corpus.sources}
        themes={corpus.themes}
      />
    </main>
  );
}
