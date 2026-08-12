import { dimensions, principles, roadmap } from "@/data/project";

const Arrow = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none">
    <path d="M4 10h11M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Argumentaire civique — accueil">
          <span className="brand-mark">AC</span>
          <span>Argumentaire civique</span>
        </a>
        <nav aria-label="Navigation principale">
          <a href="#methode">Méthode</a>
          <a href="#dimensions">Dimensions</a>
          <a href="/population">Population</a>
          <a href="/composer">Composer</a>
          <a href="/relecture">Relire</a>
          <a href="/contribuer">Contribuer</a>
        </nav>
        <a
          className="github-link"
          href="https://github.com/MrSansource/argumentaire_civique"
          target="_blank"
          rel="noreferrer"
        >
          Voir sur GitHub
          <Arrow />
        </a>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow">
          <span className="status-dot" />
          Projet ouvert · phase de cadrage
        </div>
        <h1>
          Comprendre les publics.
          <br />
          <em>Éclairer le débat.</em>
        </h1>
        <p className="hero-copy">
          Une base collaborative pour relier données de population, thèmes civiques,
          arguments sourcés et façons d&apos;expliquer — sans réduire les personnes à un profil.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="/explorer">
            Explorer le corpus
            <Arrow />
          </a>
          <a className="button button-secondary" href="#methode">
            Découvrir la méthode
          </a>
          <a className="button button-secondary" href="/population">
            Tester les croisements
          </a>
          <a className="button button-secondary" href="/composer">
            Composer une discussion
          </a>
          <a className="button button-secondary" href="/relecture">
            Ouvrir la file de révision
          </a>
          <a className="button button-secondary" href="/contribuer">
            Proposer un contenu
          </a>
        </div>
        <div className="hero-note">
          <span>01</span>
          Les croisements statistiques décrivent des groupes agrégés. Ils ne servent jamais
          à diagnostiquer ou cibler une personne.
        </div>
      </section>

      <section className="manifesto" id="methode">
        <div>
          <p className="section-kicker">Notre point de départ</p>
          <h2>Une ressource utile, pas une machinerie abstraite.</h2>
        </div>
        <div className="manifesto-copy">
          <p>
            Le projet sépare les faits, les hypothèses, les arguments et leur formulation.
            Cette structure permet de vérifier chaque source, d&apos;exprimer l&apos;incertitude et de
            composer une réponse adaptée au contexte sans générer des milliers de textes figés.
          </p>
          <a href="https://github.com/MrSansource/argumentaire_civique/tree/main/docs">
            Lire les documents de cadrage <Arrow />
          </a>
        </div>
      </section>

      <section className="principles-grid" aria-label="Principes du projet">
        {principles.map((principle, index) => (
          <article key={principle.title} className="principle-card">
            <span>0{index + 1}</span>
            <h3>{principle.title}</h3>
            <p>{principle.description}</p>
          </article>
        ))}
      </section>

      <section className="dimensions-section" id="dimensions">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Cartographie initiale</p>
            <h2>Quatre familles de dimensions</h2>
          </div>
          <p>
            Une nomenclature versionnée, documentée et révisable. Chaque catégorie indique
            son niveau de preuve et ses limites d&apos;usage.
          </p>
        </div>
        <div className="dimension-list">
          {dimensions.map((dimension) => (
            <article key={dimension.code} className="dimension-row">
              <div className="dimension-code">{dimension.code}</div>
              <div>
                <h3>{dimension.title}</h3>
                <p>{dimension.description}</p>
              </div>
              <ul>
                {dimension.examples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="roadmap-section" id="feuille-de-route">
        <div className="roadmap-intro">
          <p className="section-kicker">MVP · chemin vérifiable</p>
          <h2>Construire par couches, apprendre à chaque étape.</h2>
          <p>
            Le premier produit prouvera la navigation, la traçabilité et l&apos;édition avant
            toute génération massive par modèle de langage.
          </p>
        </div>
        <ol className="roadmap-list">
          {roadmap.map((item, index) => (
            <li key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <small>{item.status}</small>
            </li>
          ))}
        </ol>
      </section>

      <section className="closing">
        <p className="section-kicker">Contribuer</p>
        <h2>Le désaccord fait partie des données.</h2>
        <p>
          Chaque proposition doit pouvoir être discutée, sourcée, amendée et replacée dans
          son contexte. Le dépôt GitHub constitue pour l&apos;instant l&apos;espace de travail commun.
        </p>
        <a className="button button-light" href="/contribuer">
          Préparer une proposition
          <Arrow />
        </a>
      </section>

      <footer>
        <div className="brand">
          <span className="brand-mark">AC</span>
          <span>Argumentaire civique</span>
        </div>
        <p>Prototype de cadrage · contenu à construire collectivement</p>
        <p>2026</p>
      </footer>
    </main>
  );
}
