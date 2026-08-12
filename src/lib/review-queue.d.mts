import type {
  CorpusArgument,
  CorpusClaim,
  CorpusEpisode,
  CorpusReference,
  CorpusSource,
  CorpusTheme,
  CorpusVerification,
} from "./corpus";

export type ReviewLaneId =
  | "contradicted"
  | "open"
  | "missing"
  | "inconclusive"
  | "qualified"
  | "supported";

export type ReviewLane = {
  id: ReviewLaneId;
  label: string;
  shortLabel: string;
  description: string;
  nextAction: string;
};

export type ReviewQueueItem = {
  claimId: string;
  statementFr: string;
  epistemicNote: string;
  claimType: string;
  reviewStatus: CorpusClaim["status"];
  laneId: ReviewLaneId;
  laneLabel: string;
  laneShortLabel: string;
  laneRank: number;
  laneDescription: string;
  nextAction: string;
  sourceId: string | null;
  sourceName: string;
  episodeId: string;
  episodeTitle: string;
  episodeUrl: string | null;
  segmentIds: string[];
  arguments: Array<Pick<CorpusArgument, "id" | "title" | "status">>;
  verifications: CorpusVerification[];
  references: CorpusReference[];
};

export type ReviewQueue = {
  items: ReviewQueueItem[];
  countsByLane: Record<ReviewLaneId, number>;
  argumentCoverage: Array<{
    argumentId: string;
    title: string;
    status: CorpusArgument["status"];
    claimCount: number;
    verifiedCount: number;
    coveragePercent: number;
    laneId: ReviewLaneId;
    laneShortLabel: string;
  }>;
  themeCoverage: Array<{
    themeId: string;
    label: string;
    description: string;
    argumentCount: number;
    claimCount: number;
    sourceCount: number;
    referenceCount: number;
    statusId: "empty" | "single-source" | "multi-source";
    statusLabel: string;
    statusRank: number;
    nextAction: string;
  }>;
  totalClaims: number;
  verifiedClaims: number;
  draftClaims: number;
};

export const REVIEW_LANES: ReviewLane[];
export function classifyReviewLane(verifications: CorpusVerification[]): ReviewLane & { rank: number };
export function buildReviewQueue(corpus: {
  claims: CorpusClaim[];
  episodes: CorpusEpisode[];
  sources: CorpusSource[];
  references: CorpusReference[];
  verifications: CorpusVerification[];
  arguments: CorpusArgument[];
  themes: CorpusTheme[];
}): ReviewQueue;
