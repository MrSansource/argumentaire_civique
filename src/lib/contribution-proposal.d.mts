export type ContributionInput = {
  type: string;
  themeId: string;
  title: string;
  sourceUrl: string;
  summaryFr: string;
  evidenceFr: string;
  objectionFr: string;
  caveatsFr: string;
  publicSubmissionAcknowledged: boolean;
  noSensitiveTargetingAcknowledged: boolean;
};

export type ContributionProposal = {
  schemaVersion: 1;
  type: string;
  title: string;
  themeId: string;
  sourceUrl: string | null;
  summaryFr: string;
  evidenceFr: string;
  objectionFr: string;
  caveatsFr: string | null;
  policy: {
    publicSubmissionAcknowledged: true;
    noSensitiveTargetingAcknowledged: true;
    containsPersonalData: false;
  };
  status: "proposed";
};

export function buildContributionProposal(input: ContributionInput): ContributionProposal;
export function formatContributionIssue(proposal: ContributionProposal): string;
export function buildGitHubIssueUrl(
  repositoryUrl: string,
  proposal: ContributionProposal,
): string;
