import assert from "node:assert/strict";
import test from "node:test";
import {
  buildContributionProposal,
  buildGitHubIssueUrl,
  formatContributionIssue,
} from "../src/lib/contribution-proposal.mjs";

const validInput = {
  type: "argument",
  themeId: "ecologie",
  title: "Distinguer les finalités des moyens techniques",
  sourceUrl: "https://example.org/source",
  summaryFr:
    "Une politique cohérente doit expliciter ses finalités avant de choisir les instruments qui permettront de les poursuivre collectivement.",
  evidenceFr:
    "La proposition distingue une prémisse normative des observations empiriques qui servent ensuite à comparer plusieurs moyens possibles.",
  objectionFr:
    "Une discussion prolongée sur les finalités peut retarder des mesures urgentes dont les bénéfices sont déjà suffisamment documentés.",
  caveatsFr: "La formulation ne doit pas opposer systématiquement technique et transformation sociale.",
  publicSubmissionAcknowledged: true,
  noSensitiveTargetingAcknowledged: true,
};

test("construit une proposition normalisée", () => {
  const proposal = buildContributionProposal(validInput);
  assert.equal(proposal.status, "proposed");
  assert.equal(proposal.sourceUrl, "https://example.org/source");
  assert.equal(proposal.policy.containsPersonalData, false);
});

test("refuse une proposition sans objection", () => {
  assert.throws(
    () => buildContributionProposal({ ...validInput, objectionFr: "Trop court" }),
    /L’objection doit contenir/,
  );
});

test("refuse une URL non web", () => {
  assert.throws(
    () => buildContributionProposal({ ...validInput, sourceUrl: "file:///secret.txt" }),
    /HTTP ou HTTPS/,
  );
});

test("refuse une contribution sans accord éthique", () => {
  assert.throws(
    () => buildContributionProposal({ ...validInput, noSensitiveTargetingAcknowledged: false }),
    /ciblage sensible/,
  );
});

test("génère une issue GitHub traçable", () => {
  const proposal = buildContributionProposal(validInput);
  const issueBody = formatContributionIssue(proposal);
  const issueUrl = new URL(buildGitHubIssueUrl("https://github.com/example/project", proposal));

  assert.match(issueBody, /Relecture attendue/);
  assert.equal(issueUrl.pathname, "/example/project/issues/new");
  assert.match(issueUrl.searchParams.get("title"), /Contribution/);
  assert.match(issueUrl.searchParams.get("body"), /Données de la proposition/);
});
