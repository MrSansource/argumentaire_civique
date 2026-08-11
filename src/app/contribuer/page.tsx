import type { Metadata } from "next";
import Link from "next/link";
import { ContributionForm } from "@/components/contribution-form";
import { corpus } from "@/lib/corpus";

const repositoryUrl = "https://github.com/MrSansource/argumentaire_civique";

export const metadata: Metadata = {
  title: "Contribuer · Argumentaire civique",
  description: "Préparer une source, un argument ou une correction structurée pour la relecture collective.",
};

export default function ContributionPage() {
  return (
    <main className="contribution-page">
      <header className="site-header contribution-header">
        <Link className="brand" href="/" aria-label="Argumentaire civique — accueil">
          <span className="brand-mark">AC</span>
          <span>Argumentaire civique</span>
        </Link>
        <nav aria-label="Navigation de contribution">
          <Link href="/explorer">Corpus</Link>
          <Link href="/population">Population</Link>
          <a href="#regles">Règles</a>
        </nav>
        <Link className="github-link" href="/">← Retour au manifeste</Link>
      </header>

      <section className="contribution-hero">
        <p className="section-kicker">Contribution publique · sans compte interne</p>
        <h1>Proposer sans confondre<br /><em>conviction et validation.</em></h1>
        <p>
          Le formulaire transforme une intuition en objet relisible : thèse, source, justification,
          objection et limites. GitHub conserve ensuite la discussion et l&apos;historique.
        </p>
      </section>

      <section className="contribution-rules" id="regles" aria-label="Règles de contribution">
        <article><span>01</span><h2>Public par choix</h2><p>Rien ne quitte cette page avant l&apos;ouverture et la confirmation explicite d&apos;une issue GitHub.</p></article>
        <article><span>02</span><h2>Objection requise</h2><p>Une proposition sans critique sérieuse reste trop fragile pour rejoindre le corpus.</p></article>
        <article><span>03</span><h2>Aucun profil sensible</h2><p>Pas de données personnelles, de diagnostic ni de ciblage politique individualisé.</p></article>
      </section>

      <ContributionForm repositoryUrl={repositoryUrl} themes={corpus.themes} />
    </main>
  );
}
