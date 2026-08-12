import type { Metadata } from "next";
import Link from "next/link";
import { ReviewDashboard } from "@/components/review-dashboard";
import { corpus } from "@/lib/corpus";
import { buildReviewQueue } from "@/lib/review-queue.mjs";

export const metadata: Metadata = {
  title: "File de révision · Argumentaire civique",
  description: "Prioriser la vérification des affirmations et mesurer la couverture documentaire des arguments.",
};

export default function ReviewPage() {
  const queue = buildReviewQueue(corpus);

  return (
    <main className="review-page">
      <header className="site-header review-header">
        <Link className="brand" href="/" aria-label="Argumentaire civique — accueil">
          <span className="brand-mark">AC</span>
          <span>Argumentaire civique</span>
        </Link>
        <nav aria-label="Navigation de révision">
          <Link href="/explorer">Corpus</Link>
          <Link href="/composer">Composer</Link>
          <Link href="/contribuer">Contribuer</Link>
        </nav>
        <Link className="github-link" href="/">← Retour au manifeste</Link>
      </header>

      <section className="review-hero">
        <div>
          <p className="section-kicker">Atelier éditorial · calcul transparent</p>
          <h1>Relire ce qui manque,<br /><em>pas seulement ce qui convainc.</em></h1>
          <p>
            La file relie chaque affirmation à sa vidéo, ses arguments et ses vérifications.
            Elle rend visibles les lacunes sans confondre couverture documentaire et vérité.
          </p>
        </div>
        <dl>
          <div><dt>{queue.totalClaims}</dt><dd>affirmations en file</dd></div>
          <div><dt>{queue.countsByLane.missing}</dt><dd>sans vérification externe</dd></div>
          <div><dt>{queue.countsByLane.inconclusive}</dt><dd>résultats inconclusifs</dd></div>
          <div><dt>{queue.verifiedClaims}</dt><dd>avec au moins une vérification</dd></div>
        </dl>
      </section>

      <section className="review-method" aria-label="Méthode de révision">
        <article><span>01</span><h2>Localiser</h2><p>Revenir au passage source et vérifier que la paraphrase respecte son contexte.</p></article>
        <article><span>02</span><h2>Confronter</h2><p>Choisir une source externe adaptée au type exact d&apos;affirmation et noter ses limites.</p></article>
        <article><span>03</span><h2>Décider</h2><p>Reformuler, nuancer, contredire ou valider humainement avec une justification traçable.</p></article>
      </section>

      <ReviewDashboard
        queue={queue}
        sources={corpus.sources.map(({ id, name }) => ({ id, name }))}
      />
    </main>
  );
}
